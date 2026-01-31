#!/usr/bin/env python3
"""
System Metrics Monitor for Tourist Safety System
Monitors CPU, Memory, Disk usage and service performance
"""

import psutil
import time
import json
import os
from datetime import datetime
import requests
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SystemMetrics:
    def __init__(self):
        self.metrics_file = os.path.join(os.path.dirname(__file__), 'metrics.json')
        self.services = {
            'backend': 'http://localhost:3001/health',
            'ai_service': 'http://localhost:8000/health',
            'frontend': 'http://localhost:5173'
        }
    
    def get_system_metrics(self) -> Dict:
        """Get current system metrics"""
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu': {
                'percent': psutil.cpu_percent(interval=1),
                'count': psutil.cpu_count(),
                'load_avg': os.getloadavg() if hasattr(os, 'getloadavg') else None
            },
            'memory': {
                'total': psutil.virtual_memory().total,
                'available': psutil.virtual_memory().available,
                'percent': psutil.virtual_memory().percent,
                'used': psutil.virtual_memory().used
            },
            'disk': {
                'total': psutil.disk_usage('/').total,
                'used': psutil.disk_usage('/').used,
                'free': psutil.disk_usage('/').free,
                'percent': psutil.disk_usage('/').percent
            },
            'network': {
                'bytes_sent': psutil.net_io_counters().bytes_sent,
                'bytes_recv': psutil.net_io_counters().bytes_recv,
                'packets_sent': psutil.net_io_counters().packets_sent,
                'packets_recv': psutil.net_io_counters().packets_recv
            }
        }
    
    def check_service_health(self, service_name: str, url: str) -> Dict:
        """Check health of a specific service"""
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5)
            response_time = (time.time() - start_time) * 1000  # Convert to ms
            
            return {
                'service': service_name,
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'response_time_ms': round(response_time, 2),
                'status_code': response.status_code,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'service': service_name,
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_process_metrics(self) -> List[Dict]:
        """Get metrics for running processes"""
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                proc_info = proc.info
                # Filter for our application processes
                if any(keyword in proc_info['name'].lower() for keyword in ['python', 'node', 'npm']):
                    processes.append({
                        'pid': proc_info['pid'],
                        'name': proc_info['name'],
                        'cpu_percent': proc_info['cpu_percent'],
                        'memory_percent': proc_info['memory_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return processes
    
    def collect_all_metrics(self) -> Dict:
        """Collect all system and service metrics"""
        metrics = {
            'system': self.get_system_metrics(),
            'services': {},
            'processes': self.get_process_metrics()
        }
        
        # Check service health
        for service_name, url in self.services.items():
            metrics['services'][service_name] = self.check_service_health(service_name, url)
        
        return metrics
    
    def save_metrics(self, metrics: Dict):
        """Save metrics to file"""
        try:
            # Load existing metrics
            if os.path.exists(self.metrics_file):
                with open(self.metrics_file, 'r') as f:
                    all_metrics = json.load(f)
            else:
                all_metrics = []
            
            # Add new metrics
            all_metrics.append(metrics)
            
            # Keep only last 1000 entries
            if len(all_metrics) > 1000:
                all_metrics = all_metrics[-1000:]
            
            # Save back to file
            with open(self.metrics_file, 'w') as f:
                json.dump(all_metrics, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save metrics: {e}")
    
    def print_metrics(self, metrics: Dict):
        """Print metrics in a readable format"""
        print("\n" + "="*60)
        print("🖥️  TOURIST SAFETY SYSTEM METRICS")
        print("="*60)
        
        # System metrics
        system = metrics['system']
        print(f"⏰ Timestamp: {system['timestamp']}")
        print(f"🔥 CPU Usage: {system['cpu']['percent']:.1f}%")
        print(f"💾 Memory Usage: {system['memory']['percent']:.1f}% ({system['memory']['used']//1024//1024} MB used)")
        print(f"💿 Disk Usage: {system['disk']['percent']:.1f}% ({system['disk']['used']//1024//1024//1024} GB used)")
        
        # Service health
        print("\n🏥 Service Health:")
        for service_name, health in metrics['services'].items():
            status_icon = "✅" if health['status'] == 'healthy' else "❌"
            response_time = f" ({health.get('response_time_ms', 0):.0f}ms)" if 'response_time_ms' in health else ""
            print(f"   {status_icon} {service_name.title()}: {health['status']}{response_time}")
            if 'error' in health:
                print(f"      Error: {health['error']}")
        
        # Top processes
        print("\n🔄 Top Processes:")
        top_processes = sorted(metrics['processes'], key=lambda x: x['cpu_percent'], reverse=True)[:5]
        for proc in top_processes:
            print(f"   PID {proc['pid']}: {proc['name']} - CPU: {proc['cpu_percent']:.1f}%, Memory: {proc['memory_percent']:.1f}%")
    
    def monitor_continuous(self, interval_seconds: int = 60):
        """Start continuous monitoring"""
        print(f"🔄 Starting continuous monitoring (every {interval_seconds} seconds)")
        print("Press Ctrl+C to stop")
        
        try:
            while True:
                metrics = self.collect_all_metrics()
                self.print_metrics(metrics)
                self.save_metrics(metrics)
                time.sleep(interval_seconds)
        except KeyboardInterrupt:
            print("\n👋 Monitoring stopped")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Tourist Safety System Metrics Monitor')
    parser.add_argument('--continuous', action='store_true', help='Run continuous monitoring')
    parser.add_argument('--interval', type=int, default=60, help='Monitoring interval in seconds (default: 60)')
    
    args = parser.parse_args()
    
    monitor = SystemMetrics()
    
    if args.continuous:
        monitor.monitor_continuous(args.interval)
    else:
        metrics = monitor.collect_all_metrics()
        monitor.print_metrics(metrics)
        monitor.save_metrics(metrics)

if __name__ == "__main__":
    main()
