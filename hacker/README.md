# GearGuard - The Ultimate Maintenance Tracker

A smart maintenance management system that helps companies manage equipment, maintenance teams, and maintenance requests with intelligent automation features.

## Features

### 🔧 Equipment Management
- Track equipment details: name, serial number, purchase date, warranty, location, department
- Equipment Health Score (0-100) with automatic updates
- Smart maintenance team assignment
- Equipment health warnings and breakdown tracking

### 👥 Maintenance Team Management
- Support for multiple specialized teams (Mechanics, Electricians, IT Support)
- Technician workload tracking and smart assignment
- Team performance analytics

### 📋 Maintenance Request Management
- Corrective (breakdown) and Preventive (routine) maintenance requests
- Kanban board with drag-and-drop functionality
- Request statuses: New, In Progress, Repaired, Scrap
- Smart priority assignment based on equipment health and warranty status

### 🤖 Smart Automation Features
- Automatic team assignment when equipment is selected
- Intelligent technician suggestion based on workload
- Priority calculation based on equipment health and warranty
- Equipment breakdown warnings (3+ breakdowns in 30 days)

### 📅 Preventive Maintenance Scheduling
- Calendar view for scheduling preventive maintenance
- Visual priority indicators
- Monthly navigation and task overview

### 💡 Intelligent Warning System
- Equipment health monitoring
- Warranty expiration alerts
- Breakdown pattern detection
- Scrapping recommendations

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Drag & Drop**: React DnD
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Routing**: React Router DOM
- **Data Storage**: LocalStorage (for demo purposes)

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gearguard-maintenance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Usage Guide

### Dashboard
- Overview of maintenance operations
- Key statistics and metrics
- Recent requests and critical equipment alerts
- Equipment breakdown warnings

### Equipment Management
- Add new equipment with complete details
- Edit existing equipment information
- View equipment health scores and maintenance history
- Smart maintenance button showing open request count

### Maintenance Requests
- Create corrective and preventive maintenance requests
- Drag and drop requests between status columns
- Filter requests by type, priority, and technician
- Automatic priority and technician assignment

### Calendar View
- Schedule preventive maintenance tasks
- Visual calendar with color-coded priorities
- Monthly navigation
- Click any date to create new maintenance tasks

### Teams & Technicians
- View team structure and specializations
- Monitor technician workloads
- Track team performance metrics
- Equipment assignment overview

## Smart Features

### Health Score System
- Initial score: 100 for new equipment
- -10 points for each corrective (breakdown) request
- +5 points for completed preventive maintenance
- Score set to 0 when equipment is scrapped

### Priority Assignment Rules
- **High Priority**: Equipment health < 40 OR warranty expired
- **Medium Priority**: Normal breakdown requests
- **Low Priority**: Preventive maintenance requests

### Technician Assignment
- Automatically suggests technician from appropriate team
- Based on least number of active requests
- Considers team specialization matching

### Warning System
- Equipment with 3+ breakdowns in 30 days triggers scrap warning
- Health score below 40 triggers attention warning
- Expired warranty triggers replacement consideration

## Data Structure

The application uses a simple in-memory data store with localStorage persistence. In a production environment, this would be replaced with a proper database and API.

### Equipment
- ID, name, serial number
- Purchase date, warranty expiry
- Location, department
- Assigned team ID
- Health score, usability status

### Teams
- ID, name, specialization
- Associated technicians and equipment

### Technicians
- ID, name, team assignment
- Avatar, active request count

### Requests
- ID, subject, equipment reference
- Type (Corrective/Preventive)
- Scheduled date, duration
- Assigned technician, priority
- Status, creation timestamp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- Real-time notifications
- Mobile app support
- Advanced analytics and reporting
- Integration with IoT sensors
- Automated scheduling algorithms
- Multi-tenant support
- API integration capabilities