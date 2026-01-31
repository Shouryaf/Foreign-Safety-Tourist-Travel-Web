const axios = require('axios');
const fs = require('fs');
const path = require('path');

class HealthMonitor {
    constructor() {
        this.services = {
            frontend: { url: 'http://localhost:5173', name: 'Frontend' },
            backend: { url: 'http://localhost:3001/health', name: 'Backend API' },
            aiService: { url: 'http://localhost:8000/health', name: 'AI Service' },
            blockchain: { url: 'http://localhost:8545', name: 'Blockchain Node' }
        };
        this.logFile = path.join(__dirname, 'health-log.json');
    }

    async checkService(service) {
        try {
            const startTime = Date.now();
            const response = await axios.get(service.url, { timeout: 5000 });
            const responseTime = Date.now() - startTime;
            
            return {
                name: service.name,
                status: 'healthy',
                responseTime,
                statusCode: response.status,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                name: service.name,
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async checkAllServices() {
        console.log('🏥 Tourist Safety System Health Check');
        console.log('=====================================');
        
        const results = [];
        
        for (const [key, service] of Object.entries(this.services)) {
            const result = await this.checkService(service);
            results.push(result);
            
            const statusIcon = result.status === 'healthy' ? '✅' : '❌';
            const responseInfo = result.responseTime ? ` (${result.responseTime}ms)` : '';
            
            console.log(`${statusIcon} ${result.name}: ${result.status}${responseInfo}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        }
        
        // Save to log file
        this.saveHealthLog(results);
        
        const healthyCount = results.filter(r => r.status === 'healthy').length;
        const totalCount = results.length;
        
        console.log('\n📊 Summary:');
        console.log(`   Healthy: ${healthyCount}/${totalCount} services`);
        console.log(`   System Status: ${healthyCount === totalCount ? '🟢 All Systems Operational' : '🟡 Some Issues Detected'}`);
        
        return results;
    }

    saveHealthLog(results) {
        try {
            let logs = [];
            if (fs.existsSync(this.logFile)) {
                const data = fs.readFileSync(this.logFile, 'utf8');
                logs = JSON.parse(data);
            }
            
            logs.push({
                timestamp: new Date().toISOString(),
                results
            });
            
            // Keep only last 100 entries
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }
            
            fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Failed to save health log:', error.message);
        }
    }

    async startContinuousMonitoring(intervalMinutes = 5) {
        console.log(`🔄 Starting continuous health monitoring (every ${intervalMinutes} minutes)`);
        
        // Initial check
        await this.checkAllServices();
        
        // Set up interval
        setInterval(async () => {
            console.log('\n' + '='.repeat(50));
            await this.checkAllServices();
        }, intervalMinutes * 60 * 1000);
    }
}

// CLI usage
if (require.main === module) {
    const monitor = new HealthMonitor();
    
    const args = process.argv.slice(2);
    if (args.includes('--continuous')) {
        const interval = parseInt(args[args.indexOf('--interval') + 1]) || 5;
        monitor.startContinuousMonitoring(interval);
    } else {
        monitor.checkAllServices();
    }
}

module.exports = HealthMonitor;
