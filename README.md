# 🏨 Hotel Room Booking Engine

A modern hotel room booking application built with Angular 21, TypeScript, and Bootstrap 5. Browse rooms, make bookings, and view your reservation history - all with a responsive, user-friendly interface.

![Angular](https://img.shields.io/badge/Angular-21.0.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🏨 Browse and view hotel rooms with detailed information
- 🔍 Filter rooms by type (Single, Double, Suite, Deluxe)
- 📝 Interactive booking form with validation
- 📜 View booking history
- 🔔 Real-time toast notifications
- 📱 Fully responsive design (mobile, tablet, desktop)
- 💾 Local data persistence
- 🎨 Modern UI with Bootstrap 5

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:
- **Node.js** v20+ ([Download](https://nodejs.org/))
- **npm** v11+ (comes with Node.js)

### Installation & Running

```bash
# 1. Clone the repository
git clone https://github.com/Ayen241/Hotel-Room-Booking-Engine.git
cd Hotel-Room-Booking-Engine

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

**That's it!** 🎉 Open your browser and go to **http://localhost:4200/**

The app will automatically reload when you make changes to files.

### Alternative Commands

```bash
# Run with Angular CLI
ng serve

# Build for production
npm run build

# Run tests
npm test

# Build in watch mode
npm run watch
```

## 💡 How to Use

### 1️⃣ Browse Rooms
- Open the app at `http://localhost:4200/`
- View all available hotel rooms with prices and amenities

### 2️⃣ Filter Rooms
- Use the dropdown to filter by room type
- Options: All, Single, Double, Suite, Deluxe

### 3️⃣ Book a Room
- Click **"Book Now"** on any room
- Fill in the booking form:
  - **Guest Name** (required)
  - **Email** (valid email required)
  - **Check-in Date** (today or future)
  - **Check-out Date** (must be after check-in)
- Click **"Confirm Booking"**
- See success notification! ✅

### 4️⃣ View Booking History
- Click **"Booking History"** in the navigation
- See all your bookings with details
- Bookings are saved in browser storage

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.0.0 | Frontend Framework |
| TypeScript | 5.9.2 | Type-safe JavaScript |
| Bootstrap | 5.3.8 | UI Components & Styling |
| RxJS | 7.8.0 | Reactive Programming |
| MockAPI.io | - | Backend API |
| Vitest | 4.0.8 | Unit Testing |

## ⚠️ Important Notes

- **No real payments** - This is a booking interface demonstration only
- **LocalStorage** - Bookings are saved in your browser (won't sync across devices)
- **MockAPI** - Backend may reset data periodically
- **No authentication** - No login required (simplified for demo)
- **Single bookings** - Book one room at a time
- **Internet required** - Needs connection for initial load and API calls

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 4200 in use** | Run `ng serve --port 4300` |
| **Dependencies fail** | Run `npm cache clean --force` then `npm install` |
| **API not responding** | Check internet connection, verify MockAPI is accessible |
| **TypeScript errors** | Run `npm install` to ensure all dependencies are installed |
| **App won't start** | Make sure Node.js v20+ is installed |
| **Blank page** | Check browser console (F12) for errors |

## 📁 Project Structure

```
src/app/
├── components/        # Reusable UI components (room-card, modal, toast, spinner)
├── pages/             # Page components (room-list, booking-history)
├── services/          # API & business logic (room, booking, toast services)
├── models/            # TypeScript interfaces & enums
└── shared/            # Constants & utilities
```

## 🔌 API Information

**Backend:** MockAPI.io (Already configured - no setup needed)

**Base URL:** `https://6932963ae5a9e342d26fd8e9.mockapi.io/`

The API is pre-configured and ready to use. All room data is already populated.

## 🧪 Testing & Building

```bash
# Run unit tests
npm test

# Build for production
npm run build

# Build in watch mode
npm run watch
```

Production build will be in the `dist/` directory.

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👤 Author

**Ayen241**
- GitHub: [@Ayen241](https://github.com/Ayen241)
- Repository: [Hotel-Room-Booking-Engine](https://github.com/Ayen241/Hotel-Room-Booking-Engine)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/Ayen241/Hotel-Room-Booking-Engine/issues).

---

**Built with ❤️ using Angular 21 • Bootstrap 5 • TypeScript**

*This project demonstrates Angular best practices and modern web development techniques.*
