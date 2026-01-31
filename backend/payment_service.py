from fastapi import HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import stripe
import razorpay
import os
from datetime import datetime
import uuid
import json

# Payment Models
class PaymentRequest(BaseModel):
    booking_id: str
    amount: float
    currency: str = "INR"
    payment_method: str  # "stripe", "razorpay", "upi", "wallet"
    user_id: str
    description: str

class PaymentResponse(BaseModel):
    payment_id: str
    status: str
    amount: float
    currency: str
    payment_url: Optional[str] = None
    client_secret: Optional[str] = None

class RefundRequest(BaseModel):
    payment_id: str
    amount: Optional[float] = None
    reason: str

# Payment Service Class
class PaymentService:
    def __init__(self):
        # Initialize payment gateways
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_dummy_key")
        self.razorpay_client = razorpay.Client(
            auth=(
                os.getenv("RAZORPAY_KEY_ID", "rzp_test_dummy"),
                os.getenv("RAZORPAY_KEY_SECRET", "dummy_secret")
            )
        )
        
    async def create_payment_intent(self, payment_request: PaymentRequest) -> PaymentResponse:
        """Create payment intent based on payment method"""
        try:
            if payment_request.payment_method == "stripe":
                return await self._create_stripe_payment(payment_request)
            elif payment_request.payment_method == "razorpay":
                return await self._create_razorpay_payment(payment_request)
            elif payment_request.payment_method == "upi":
                return await self._create_upi_payment(payment_request)
            elif payment_request.payment_method == "wallet":
                return await self._create_wallet_payment(payment_request)
            else:
                raise HTTPException(status_code=400, detail="Unsupported payment method")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")

    async def _create_stripe_payment(self, payment_request: PaymentRequest) -> PaymentResponse:
        """Create Stripe payment intent"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(payment_request.amount * 100),  # Convert to cents
                currency=payment_request.currency.lower(),
                metadata={
                    'booking_id': payment_request.booking_id,
                    'user_id': payment_request.user_id
                },
                description=payment_request.description
            )
            
            return PaymentResponse(
                payment_id=intent.id,
                status="pending",
                amount=payment_request.amount,
                currency=payment_request.currency,
                client_secret=intent.client_secret
            )
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

    async def _create_razorpay_payment(self, payment_request: PaymentRequest) -> PaymentResponse:
        """Create Razorpay payment order"""
        try:
            order_data = {
                'amount': int(payment_request.amount * 100),  # Convert to paise
                'currency': payment_request.currency,
                'receipt': f"booking_{payment_request.booking_id}",
                'notes': {
                    'booking_id': payment_request.booking_id,
                    'user_id': payment_request.user_id
                }
            }
            
            order = self.razorpay_client.order.create(data=order_data)
            
            return PaymentResponse(
                payment_id=order['id'],
                status="pending",
                amount=payment_request.amount,
                currency=payment_request.currency,
                payment_url=f"https://checkout.razorpay.com/v1/checkout.js"
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")

    async def _create_upi_payment(self, payment_request: PaymentRequest) -> PaymentResponse:
        """Create UPI payment (mock implementation)"""
        payment_id = f"upi_{uuid.uuid4().hex[:12]}"
        
        # Generate UPI payment URL (mock)
        upi_url = f"upi://pay?pa=merchant@paytm&pn=TrainXceralate&am={payment_request.amount}&cu={payment_request.currency}&tn={payment_request.description}"
        
        return PaymentResponse(
            payment_id=payment_id,
            status="pending",
            amount=payment_request.amount,
            currency=payment_request.currency,
            payment_url=upi_url
        )

    async def _create_wallet_payment(self, payment_request: PaymentRequest) -> PaymentResponse:
        """Create wallet payment (mock implementation)"""
        payment_id = f"wallet_{uuid.uuid4().hex[:12]}"
        
        # Mock wallet payment - in real implementation, deduct from user's wallet
        return PaymentResponse(
            payment_id=payment_id,
            status="completed",  # Instant for wallet payments
            amount=payment_request.amount,
            currency=payment_request.currency
        )

    async def verify_payment(self, payment_id: str, payment_method: str) -> Dict[str, Any]:
        """Verify payment status"""
        try:
            if payment_method == "stripe":
                intent = stripe.PaymentIntent.retrieve(payment_id)
                return {
                    "payment_id": intent.id,
                    "status": intent.status,
                    "amount": intent.amount / 100,
                    "currency": intent.currency.upper()
                }
            elif payment_method == "razorpay":
                payment = self.razorpay_client.payment.fetch(payment_id)
                return {
                    "payment_id": payment['id'],
                    "status": payment['status'],
                    "amount": payment['amount'] / 100,
                    "currency": payment['currency'].upper()
                }
            else:
                # Mock verification for UPI and wallet
                return {
                    "payment_id": payment_id,
                    "status": "captured",
                    "amount": 0,
                    "currency": "INR"
                }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

    async def process_refund(self, refund_request: RefundRequest, payment_method: str) -> Dict[str, Any]:
        """Process payment refund"""
        try:
            if payment_method == "stripe":
                refund = stripe.Refund.create(
                    payment_intent=refund_request.payment_id,
                    amount=int(refund_request.amount * 100) if refund_request.amount else None,
                    reason="requested_by_customer",
                    metadata={"reason": refund_request.reason}
                )
                return {
                    "refund_id": refund.id,
                    "status": refund.status,
                    "amount": refund.amount / 100
                }
            elif payment_method == "razorpay":
                refund_data = {
                    "amount": int(refund_request.amount * 100) if refund_request.amount else None,
                    "notes": {"reason": refund_request.reason}
                }
                refund = self.razorpay_client.payment.refund(refund_request.payment_id, refund_data)
                return {
                    "refund_id": refund['id'],
                    "status": refund['status'],
                    "amount": refund['amount'] / 100
                }
            else:
                # Mock refund for UPI and wallet
                return {
                    "refund_id": f"refund_{uuid.uuid4().hex[:12]}",
                    "status": "processed",
                    "amount": refund_request.amount or 0
                }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Refund processing failed: {str(e)}")

    async def get_payment_methods(self, user_id: str) -> Dict[str, Any]:
        """Get available payment methods for user"""
        return {
            "payment_methods": [
                {
                    "id": "stripe",
                    "name": "Credit/Debit Card",
                    "type": "card",
                    "enabled": True,
                    "fees": "2.9% + ₹3"
                },
                {
                    "id": "razorpay",
                    "name": "Razorpay",
                    "type": "gateway",
                    "enabled": True,
                    "fees": "2% + ₹2"
                },
                {
                    "id": "upi",
                    "name": "UPI",
                    "type": "upi",
                    "enabled": True,
                    "fees": "Free"
                },
                {
                    "id": "wallet",
                    "name": "TrainXceralate Wallet",
                    "type": "wallet",
                    "enabled": True,
                    "fees": "Free",
                    "balance": await self._get_wallet_balance(user_id)
                }
            ]
        }

    async def _get_wallet_balance(self, user_id: str) -> float:
        """Get user's wallet balance (mock implementation)"""
        # In real implementation, fetch from database
        return 1500.0  # Mock balance

# Initialize payment service
payment_service = PaymentService()
