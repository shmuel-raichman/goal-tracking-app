# App Features

This file lists all the key features implemented in the Goal Tracker app.

## Core Tracking
- **Binary Goals**: New goal type that allows marking each day as Success or Failure, with dedicated UI and streak logic.
- **Goal Creation**: Set goals with specific targets (times, mins, pages, liters).
- **Flexible Frequency**: Support for Daily, Weekdays, and Weekly goals.
- **Progress Tracking**: Real-time progress bars and completion status for each goal.
- **Streak System**: Automatic calculation of current and best streaks.
- **Consistency Heatmap**: Visual representation of your activity over the last 3 months.

## User Experience
- **RTL Support**: Full support for Right-to-Left languages (like Hebrew) with automatic direction detection (`dir="auto"`) and logical spacing.
- **Dark Mode**: High-contrast dark theme for better visibility and reduced eye strain.
- **Navigation Logic**: Sub-screens navigate back to the Home screen instead of exiting, while the Home screen prompts for exit confirmation.
- **Mobile-First Design**: Optimized for touch interactions and mobile viewport.
- **Smooth Animations**: Powered by `motion/react` for fluid transitions between screens and states.

## Advanced Features
- **Encouragement System**: Personalized motivational messages shown upon goal completion (can be toggled in Settings).
- **Goal Management**: Suspend, resume, edit, or delete goals at any time.
- **History Editing**: Ability to modify past completion records for any goal.
- **Smart Reminders**: Toggleable reminders to help you stay on track.
- **Suspended Goals Filter**: Suspended goals are automatically hidden from the main dashboard to keep your focus on active tasks.

## Technical
- **Firebase Integration**: Real-time data synchronization with Firestore and secure user authentication.
- **Type Safety**: Built with TypeScript for robust and maintainable code.
- **Responsive Layout**: Adapts seamlessly to different screen sizes.
