from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
from .transport_backend import get_current_user, db

router = APIRouter(prefix="/api/social", tags=["social"])

# Pydantic Models
class PostCreate(BaseModel):
    content: str
    location: Optional[Dict[str, float]] = None
    transport_mode: Optional[str] = None
    journey_details: Optional[Dict[str, Any]] = None
    images: Optional[List[str]] = []
    model_config = ConfigDict(from_attributes=True)

class CommentCreate(BaseModel):
    content: str
    model_config = ConfigDict(from_attributes=True)

class PostResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str]
    content: str
    images: List[str]
    location: Optional[Dict[str, float]]
    transport_mode: Optional[str]
    journey_details: Optional[Dict[str, Any]]
    likes_count: int
    comments_count: int
    is_liked: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Social Media Routes
@router.post("/posts", response_model=Dict[str, Any])
async def create_post(post_data: PostCreate, current_user: dict = Depends(get_current_user)):
    try:
        post_doc = {
            "user_id": ObjectId(current_user["_id"]),
            "content": post_data.content,
            "images": post_data.images or [],
            "location": post_data.location,
            "transport_mode": post_data.transport_mode,
            "journey_details": post_data.journey_details,
            "likes": [],
            "comments": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.posts.insert_one(post_doc)
        
        # Update user's post count
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$inc": {"social_stats.posts": 1}}
        )
        
        return {"success": True, "post_id": str(result.inserted_id)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@router.get("/feed", response_model=List[PostResponse])
async def get_feed(
    page: int = 1, 
    limit: int = 20,
    location_filter: Optional[str] = None,
    transport_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        skip = (page - 1) * limit
        
        # Build aggregation pipeline
        pipeline = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$unwind": "$user"},
            {
                "$addFields": {
                    "likes_count": {"$size": "$likes"},
                    "comments_count": {"$size": "$comments"},
                    "is_liked": {"$in": [ObjectId(current_user["_id"]), "$likes"]}
                }
            },
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        # Add filters if provided
        match_conditions = {}
        if location_filter:
            match_conditions["location"] = {"$exists": True}
        if transport_filter:
            match_conditions["transport_mode"] = transport_filter
            
        if match_conditions:
            pipeline.insert(0, {"$match": match_conditions})
        
        posts = await db.posts.aggregate(pipeline).to_list(length=limit)
        
        # Format response
        formatted_posts = []
        for post in posts:
            formatted_posts.append({
                "id": str(post["_id"]),
                "user_id": str(post["user_id"]),
                "user_name": post["user"]["name"],
                "user_avatar": post["user"].get("profile_picture"),
                "content": post["content"],
                "images": post.get("images", []),
                "location": post.get("location"),
                "transport_mode": post.get("transport_mode"),
                "journey_details": post.get("journey_details"),
                "likes_count": post["likes_count"],
                "comments_count": post["comments_count"],
                "is_liked": post["is_liked"],
                "created_at": post["created_at"]
            })
        
        return formatted_posts
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")

@router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = ObjectId(current_user["_id"])
        post_obj_id = ObjectId(post_id)
        
        # Check if post exists
        post = await db.posts.find_one({"_id": post_obj_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Toggle like
        if user_id in post.get("likes", []):
            # Unlike
            await db.posts.update_one(
                {"_id": post_obj_id},
                {"$pull": {"likes": user_id}}
            )
            is_liked = False
        else:
            # Like
            await db.posts.update_one(
                {"_id": post_obj_id},
                {"$addToSet": {"likes": user_id}}
            )
            is_liked = True
        
        # Get updated like count
        updated_post = await db.posts.find_one({"_id": post_obj_id})
        likes_count = len(updated_post.get("likes", []))
        
        return {"success": True, "is_liked": is_liked, "likes_count": likes_count}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to toggle like: {str(e)}")

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str, 
    comment_data: CommentCreate, 
    current_user: dict = Depends(get_current_user)
):
    try:
        post_obj_id = ObjectId(post_id)
        
        # Check if post exists
        post = await db.posts.find_one({"_id": post_obj_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        comment = {
            "id": str(uuid.uuid4()),
            "user_id": ObjectId(current_user["_id"]),
            "user_name": current_user["name"],
            "content": comment_data.content,
            "created_at": datetime.utcnow()
        }
        
        await db.posts.update_one(
            {"_id": post_obj_id},
            {"$push": {"comments": comment}}
        )
        
        return {"success": True, "comment": comment}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")

@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, current_user: dict = Depends(get_current_user)):
    try:
        post_obj_id = ObjectId(post_id)
        
        post = await db.posts.find_one({"_id": post_obj_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        comments = post.get("comments", [])
        # Sort comments by creation time
        comments.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {"comments": comments}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comments: {str(e)}")

@router.get("/users/{user_id}/posts")
async def get_user_posts(
    user_id: str, 
    page: int = 1, 
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    try:
        skip = (page - 1) * limit
        user_obj_id = ObjectId(user_id)
        
        pipeline = [
            {"$match": {"user_id": user_obj_id}},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$unwind": "$user"},
            {
                "$addFields": {
                    "likes_count": {"$size": "$likes"},
                    "comments_count": {"$size": "$comments"},
                    "is_liked": {"$in": [ObjectId(current_user["_id"]), "$likes"]}
                }
            },
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        posts = await db.posts.aggregate(pipeline).to_list(length=limit)
        
        # Format response
        formatted_posts = []
        for post in posts:
            formatted_posts.append({
                "id": str(post["_id"]),
                "user_id": str(post["user_id"]),
                "user_name": post["user"]["name"],
                "user_avatar": post["user"].get("profile_picture"),
                "content": post["content"],
                "images": post.get("images", []),
                "location": post.get("location"),
                "transport_mode": post.get("transport_mode"),
                "journey_details": post.get("journey_details"),
                "likes_count": post["likes_count"],
                "comments_count": post["comments_count"],
                "is_liked": post["is_liked"],
                "created_at": post["created_at"]
            })
        
        return formatted_posts
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user posts: {str(e)}")

@router.post("/follow/{user_id}")
async def follow_user(user_id: str, current_user: dict = Depends(get_current_user)):
    try:
        target_user_id = ObjectId(user_id)
        current_user_id = ObjectId(current_user["_id"])
        
        if target_user_id == current_user_id:
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
        # Check if target user exists
        target_user = await db.users.find_one({"_id": target_user_id})
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Add to following list
        await db.users.update_one(
            {"_id": current_user_id},
            {"$addToSet": {"following": target_user_id}}
        )
        
        # Add to followers list
        await db.users.update_one(
            {"_id": target_user_id},
            {"$addToSet": {"followers": current_user_id}}
        )
        
        # Update stats
        await db.users.update_one(
            {"_id": current_user_id},
            {"$inc": {"social_stats.following": 1}}
        )
        await db.users.update_one(
            {"_id": target_user_id},
            {"$inc": {"social_stats.followers": 1}}
        )
        
        return {"success": True, "message": "User followed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to follow user: {str(e)}")

@router.delete("/follow/{user_id}")
async def unfollow_user(user_id: str, current_user: dict = Depends(get_current_user)):
    try:
        target_user_id = ObjectId(user_id)
        current_user_id = ObjectId(current_user["_id"])
        
        # Remove from following list
        await db.users.update_one(
            {"_id": current_user_id},
            {"$pull": {"following": target_user_id}}
        )
        
        # Remove from followers list
        await db.users.update_one(
            {"_id": target_user_id},
            {"$pull": {"followers": current_user_id}}
        )
        
        # Update stats
        await db.users.update_one(
            {"_id": current_user_id},
            {"$inc": {"social_stats.following": -1}}
        )
        await db.users.update_one(
            {"_id": target_user_id},
            {"$inc": {"social_stats.followers": -1}}
        )
        
        return {"success": True, "message": "User unfollowed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unfollow user: {str(e)}")
