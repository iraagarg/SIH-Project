// GPS Transit Dashboard - Orange Theme Application

class GPSTransitDashboard {
    constructor() {
        this.sidebarOpen = false;
        this.profileDropdownOpen = false;
        this.activeSection = 'tracking';
        this.refreshInterval = null;
        this.gpsUpdateInterval = null;
        
        // Application data
        this.buses = [
            {
                id: 'BUS_001',
                licensePlate: 'DL-1234',
                route: 'Route 42 - Connaught Place Loop',
                driver: 'Rajesh Kumar',
                status: 'Active',
                location: { lat: 28.6139, lng: 77.2090 },
                passengers: 32,
                capacity: 50,
                speed: 25,
                lastUpdate: '16:05:00'
            },
            {
                id: 'BUS_002', 
                licensePlate: 'DL-5678',
                route: 'Route 15 - Airport Express',
                driver: 'Priya Sharma',
                status: 'En Route',
                location: { lat: 28.5562, lng: 77.1000 },
                passengers: 18,
                capacity: 45,
                speed: 35,
                lastUpdate: '16:04:45'
            },
            {
                id: 'BUS_003',
                licensePlate: 'DL-9012', 
                route: 'Route 23 - Metro Link',
                driver: 'Anil Verma',
                status: 'At Stop',
                location: { lat: 28.6304, lng: 77.2177 },
                passengers: 27,
                capacity: 40,
                speed: 0,
                lastUpdate: '16:05:30'
            }
        ];

        this.routes = [
            {
                id: 'ROUTE_42',
                name: 'Connaught Place Loop',
                stops: 12,
                distance: '15.2 km',
                duration: '45 min',
                activeBuses: 3,
                status: 'Active'
            },
            {
                id: 'ROUTE_15',
                name: 'Airport Express', 
                stops: 8,
                distance: '28.7 km',
                duration: '35 min',
                activeBuses: 2,
                status: 'Active'
            },
            {
                id: 'ROUTE_23',
                name: 'Metro Link',
                stops: 15,
                distance: '22.3 km', 
                duration: '55 min',
                activeBuses: 4,
                status: 'Active'
            }
        ];

        this.alerts = [
            {
                id: 'ALT_001',
                type: 'warning',
                title: 'Route Delay',
                message: 'Bus DL-1234 delayed by 8 minutes due to traffic',
                timestamp: '16:05',
                route: 'Route 42',
                priority: 'medium'
            },
            {
                id: 'ALT_002',
                type: 'success',
                title: 'On Schedule', 
                message: 'Bus DL-5678 arrived on time at Terminal 3',
                timestamp: '16:03',
                route: 'Route 15',
                priority: 'low'
            },
            {
                id: 'ALT_003',
                type: 'info',
                title: 'GPS Update',
                message: 'Real-time tracking restored for Bus DL-9012',
                timestamp: '16:01',
                route: 'Route 23', 
                priority: 'low'
            }
        ];

        this.init();
    }

    init() {
        console.log('🚌 Initializing GPS Transit Dashboard...');
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.navigateToSection('tracking'); // Default to live tracking
        this.loadUserPreferences();
        console.log('✅ GPS Transit Dashboard initialized');
    }

    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }

        // Profile dropdown
        const profileBtn = document.getElementById('profileDropdownBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleProfileDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (profileDropdown && !profileDropdown.contains(e.target) && 
                profileBtn && !profileBtn.contains(e.target)) {
                this.closeProfileDropdown();
            }
        });

        // Navigation items - Fixed navigation logic
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = item.getAttribute('data-section');
                console.log(`🔄 Navigation clicked: ${section}`);
                if (section) {
                    this.navigateToSection(section);
                    this.closeProfileDropdown();
                    
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth <= 768) {
                        this.sidebarOpen = false;
                        const sidebar = document.getElementById('sidebar');
                        if (sidebar) {
                            sidebar.classList.remove('open');
                        }
                    }
                }
            });
        });

        // Dropdown navigation items
        const dropdownItems = document.querySelectorAll('.dropdown-item[data-section]');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = item.getAttribute('data-section');
                console.log(`🔄 Dropdown navigation clicked: ${section}`);
                if (section) {
                    this.navigateToSection(section);
                    this.closeProfileDropdown();
                }
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshGPSData();
            });
        }

        // Map controls
        const mapBtns = document.querySelectorAll('.map-btn');
        mapBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                mapBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showNotification('Map view updated', 'info');
            });
        });

        // Bus markers
        const busMarkers = document.querySelectorAll('.bus-marker');
        busMarkers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                e.preventDefault();
                const busId = marker.querySelector('.bus-id').textContent;
                this.showBusDetails(busId);
            });
        });

        // Form submissions
        const settingsForms = document.querySelectorAll('.settings-form');
        settingsForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });

        // Toggle switches
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => this.handleToggleChange(e));
        });

        // Security buttons
        const securityBtns = document.querySelectorAll('.security-item .btn');
        securityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSecurityAction(e);
            });
        });

        // Route and driver card interactions
        const routeCards = document.querySelectorAll('.route-card');
        routeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectRoute(card);
            });
        });

        const driverCards = document.querySelectorAll('.driver-card');
        driverCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectDriver(card);
            });
        });

        // Responsive handling
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar) {
            sidebar.classList.toggle('open', this.sidebarOpen);
        }
        
        console.log(`📱 Sidebar ${this.sidebarOpen ? 'opened' : 'closed'}`);
    }

    toggleProfileDropdown() {
        this.profileDropdownOpen = !this.profileDropdownOpen;
        const dropdown = document.getElementById('profileDropdown');
        
        if (dropdown) {
            dropdown.classList.toggle('show', this.profileDropdownOpen);
        }
        
        console.log(`👤 Profile dropdown ${this.profileDropdownOpen ? 'opened' : 'closed'}`);
    }

    closeProfileDropdown() {
        this.profileDropdownOpen = false;
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    navigateToSection(sectionId) {
        console.log(`🧭 Navigating to: ${sectionId}`);
        
        // First, hide all sections
        const allSections = document.querySelectorAll('.content-section');
        allSections.forEach(section => {
            section.classList.remove('active');
            console.log(`❌ Hiding section: ${section.id}`);
        });
        
        // Show the target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`✅ Showing section: ${targetSection.id}`);
        } else {
            console.error(`❌ Section not found: ${sectionId}-section`);
            return;
        }

        // Update navigation active states
        const allNavItems = document.querySelectorAll('.nav-item[data-section]');
        allNavItems.forEach(item => {
            const itemSection = item.getAttribute('data-section');
            if (itemSection === sectionId) {
                item.classList.add('active');
                console.log(`🔸 Activated nav item: ${itemSection}`);
            } else {
                item.classList.remove('active');
            }
        });

        // Store current section
        this.activeSection = sectionId;

        // Scroll to top
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }

        // Section-specific actions
        if (sectionId === 'tracking') {
            setTimeout(() => {
                this.refreshGPSData();
            }, 100);
        }

        this.showNotification(`Navigated to ${this.getSectionTitle(sectionId)}`, 'info');
    }

    getSectionTitle(sectionId) {
        const titles = {
            'tracking': 'Live GPS Tracking',
            'routes': 'Route Management',
            'drivers': 'Driver Management',
            'profile': 'Profile Settings',
            'notifications': 'Notifications Center',
            'security': 'Security Settings'
        };
        return titles[sectionId] || sectionId;
    }

    startRealTimeUpdates() {
        console.log('📡 Starting real-time GPS updates...');
        
        // Update GPS data every 10 seconds
        this.gpsUpdateInterval = setInterval(() => {
            this.updateGPSData();
            this.updateFleetStats();
        }, 10000);

        // Update notifications every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.updateNotifications();
        }, 30000);

        // Animate GPS elements
        setTimeout(() => {
            this.animateGPSElements();
        }, 500);
    }

    updateGPSData() {
        // Simulate real-time GPS updates
        this.buses.forEach((bus, index) => {
            // Random passenger changes
            const passengerChange = Math.floor(Math.random() * 6) - 3;
            bus.passengers = Math.max(0, Math.min(bus.capacity, bus.passengers + passengerChange));
            
            // Random speed changes for active buses
            if (bus.status === 'Active') {
                bus.speed = Math.floor(Math.random() * 20) + 15;
            } else if (bus.status === 'En Route') {
                bus.speed = Math.floor(Math.random() * 25) + 25;
            } else {
                bus.speed = 0;
            }

            // Update timestamp
            const now = new Date();
            bus.lastUpdate = now.toTimeString().slice(0, 8);
        });

        this.updateBusDisplay();
        console.log('📍 GPS data updated');
    }

    updateBusDisplay() {
        const busCards = document.querySelectorAll('.bus-card');
        
        busCards.forEach((card, index) => {
            if (this.buses[index]) {
                const bus = this.buses[index];
                const details = card.querySelectorAll('.detail-value');
                
                if (details.length >= 4) {
                    details[1].textContent = `${bus.passengers}/${bus.capacity}`;
                    details[2].textContent = `${bus.speed} km/h`;
                    details[3].textContent = bus.lastUpdate;
                }
            }
        });
    }

    updateFleetStats() {
        const statPills = document.querySelectorAll('.stat-pill');
        
        // Calculate real stats
        const active = this.buses.filter(b => b.status === 'Active').length;
        const onTime = this.buses.filter(b => b.speed > 0).length;
        const delayed = this.buses.filter(b => b.status === 'Delayed' || Math.random() < 0.2).length;

        if (statPills.length >= 3) {
            statPills[0].querySelector('span').textContent = `${active * 13} Active`;
            statPills[1].querySelector('span').textContent = `${onTime * 11} On Time`;
            statPills[2].querySelector('span').textContent = `${delayed * 2} Delayed`;
        }
    }

    refreshGPSData() {
        console.log('🔄 Refreshing GPS data...');
        
        // Add rotation animation to refresh button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                refreshBtn.style.transform = '';
            }, 500);
        }

        // Update all GPS data
        this.updateGPSData();
        this.animateBusMarkers();
        
        this.showNotification('GPS data refreshed', 'success');
    }

    animateGPSElements() {
        // Animate GPS grid
        const gpsGrid = document.querySelector('.gps-grid');
        if (gpsGrid) {
            gpsGrid.style.animation = 'grid-move 20s linear infinite';
        }

        // Animate bus markers
        this.animateBusMarkers();

        // Animate route line
        const routeLine = document.querySelector('.route-line');
        if (routeLine) {
            routeLine.style.animation = 'route-flow 3s ease-in-out infinite';
        }
    }

    animateBusMarkers() {
        const markers = document.querySelectorAll('.bus-marker');
        markers.forEach((marker, index) => {
            setTimeout(() => {
                marker.style.animation = 'bus-pulse 2s ease-in-out infinite';
            }, index * 200);
        });
    }

    showBusDetails(busId) {
        const bus = this.buses.find(b => b.licensePlate === busId);
        if (bus) {
            this.showNotification(
                `Bus ${busId}: ${bus.passengers}/${bus.capacity} passengers, Speed: ${bus.speed} km/h`, 
                'info'
            );
        }
    }

    updateNotifications() {
        // Simulate new notifications
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            const currentCount = parseInt(notificationBadge.textContent);
            const randomChange = Math.floor(Math.random() * 3) - 1;
            const newCount = Math.max(0, currentCount + randomChange);
            notificationBadge.textContent = newCount.toString();
            
            if (newCount > 0) {
                notificationBadge.style.display = 'flex';
                // Update nav badge too
                const navBadge = document.querySelector('.nav-badge.alert');
                if (navBadge) {
                    navBadge.textContent = newCount.toString();
                }
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }

    selectRoute(routeCard) {
        // Remove active class from all route cards
        document.querySelectorAll('.route-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add active class to selected card
        routeCard.classList.add('selected');
        
        const routeName = routeCard.querySelector('h4').textContent;
        this.showNotification(`Selected route: ${routeName}`, 'info');
    }

    selectDriver(driverCard) {
        // Remove active class from all driver cards
        document.querySelectorAll('.driver-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add active class to selected card  
        driverCard.classList.add('selected');
        
        const driverName = driverCard.querySelector('h3').textContent;
        this.showNotification(`Selected driver: ${driverName}`, 'info');
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                this.showNotification('Settings saved successfully!', 'success');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        }
    }

    handleToggleChange(e) {
        const toggle = e.target;
        const setting = toggle.id;
        
        // Save preference
        localStorage.setItem(setting, toggle.checked.toString());
        
        // Show feedback with orange theme
        const toggleItem = toggle.closest('.toggle-item');
        if (toggleItem) {
            const label = toggleItem.querySelector('.toggle-label')?.textContent || 'Setting';
            const status = toggle.checked ? 'enabled' : 'disabled';
            this.showNotification(`${label} ${status}`, 'info');
        }
    }

    handleSecurityAction(e) {
        const button = e.target;
        const action = button.textContent;
        
        if (action.includes('Enable 2FA')) {
            this.show2FASetup();
        } else if (action.includes('Change Password')) {
            this.showPasswordChange();
        } else if (action.includes('Privacy Settings')) {
            this.showPrivacySettings();
        }
    }

    show2FASetup() {
        this.showNotification('2FA setup initiated - SMS verification sent', 'success');
    }

    showPasswordChange() {
        this.showNotification('Password change form opened', 'info');
    }

    showPrivacySettings() {
        this.showNotification('Privacy settings configured', 'info');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.gps-notification').forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `gps-notification gps-notification--${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle', 
            warning: 'fa-exclamation-triangle',
            info: 'fa-satellite-dish'
        };
        
        const colorMap = {
            success: '#00D2FF',
            error: '#FF4757',
            warning: '#FFAA00', 
            info: '#FF6B35'
        };

        notification.innerHTML = `
            <div class="notification-content" style="display: flex; align-items: center; gap: 12px;">
                <i class="fas ${iconMap[type]}" style="color: ${colorMap[type]}; font-size: 16px;"></i>
                <span style="color: #EAEAEA; flex: 1; font-size: 14px;">${message}</span>
            </div>
            <button class="notification-close" style="background: none; border: none; color: #B0B0B0; cursor: pointer; padding: 4px;">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add GPS notification styles
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 24px;
            background: #1A1A2E;
            border: 2px solid ${colorMap[type]};
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 400px;
            min-width: 300px;
            transform: translateX(100%);
            transition: transform 0.4s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeNotification(notification);
            });
        }

        // Auto close
        setTimeout(() => {
            this.closeNotification(notification);
        }, 4000);
    }

    closeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }
    }

    loadUserPreferences() {
        // Load toggle states
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        toggles.forEach(toggle => {
            const saved = localStorage.getItem(toggle.id);
            if (saved !== null) {
                toggle.checked = saved === 'true';
            }
        });

        console.log('⚙️ User preferences loaded');
    }

    handleResize() {
        // Close sidebar on desktop
        if (window.innerWidth > 768 && this.sidebarOpen) {
            this.sidebarOpen = false;
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }
    }

    destroy() {
        // Clean up intervals
        if (this.gpsUpdateInterval) {
            clearInterval(this.gpsUpdateInterval);
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        console.log('🛑 GPS Transit Dashboard destroyed');
    }
}

// GPS Data Manager Class
class GPSDataManager {
    constructor() {
        this.fleetData = {
            totalBuses: 45,
            activeNow: 38,
            onSchedule: 32,
            delayed: 6,
            maintenance: 4,
            offline: 3
        };

        this.realTimeData = new Map();
    }

    updateBusLocation(busId, location, speed, passengers) {
        this.realTimeData.set(busId, {
            location,
            speed,
            passengers,
            timestamp: new Date(),
            status: this.determineStatus(speed)
        });
    }

    determineStatus(speed) {
        if (speed === 0) return 'At Stop';
        if (speed > 30) return 'En Route';
        return 'Active';
    }

    getFleetSummary() {
        return {
            ...this.fleetData,
            lastUpdate: new Date().toLocaleTimeString()
        };
    }

    getBusData(busId) {
        return this.realTimeData.get(busId);
    }

    getAllActiveBuses() {
        return Array.from(this.realTimeData.values());
    }
}

// Route Optimizer Class
class RouteOptimizer {
    constructor() {
        this.routes = new Map();
    }

    addRoute(routeId, routeData) {
        this.routes.set(routeId, {
            ...routeData,
            optimized: false,
            efficiency: this.calculateEfficiency(routeData)
        });
    }

    calculateEfficiency(routeData) {
        // Simplified efficiency calculation
        const { distance, duration, stops } = routeData;
        return (stops / parseFloat(distance)) * (60 / parseFloat(duration));
    }

    optimizeRoute(routeId) {
        const route = this.routes.get(routeId);
        if (route) {
            // Simulate route optimization
            route.optimized = true;
            route.efficiency = Math.min(route.efficiency * 1.15, 1.0);
            return route;
        }
        return null;
    }

    getRouteRecommendations() {
        const routes = Array.from(this.routes.values());
        return routes
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 3);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting GPS Transit Dashboard...');
    
    // Initialize main app
    window.gpsTransitApp = new GPSTransitDashboard();
    
    // Initialize managers
    window.gpsDataManager = new GPSDataManager();
    window.routeOptimizer = new RouteOptimizer();
    
    // Add some sample route data
    window.routeOptimizer.addRoute('ROUTE_42', {
        name: 'Connaught Place Loop',
        distance: '15.2',
        duration: '45',
        stops: 12
    });
    
    window.routeOptimizer.addRoute('ROUTE_15', {
        name: 'Airport Express',
        distance: '28.7', 
        duration: '35',
        stops: 8
    });
    
    console.log('✅ GPS Transit Dashboard fully loaded');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.gpsTransitApp) {
        window.gpsTransitApp.destroy();
    }
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GPSTransitDashboard,
        GPSDataManager,
        RouteOptimizer
    };
}