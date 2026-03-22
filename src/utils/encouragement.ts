export const getEncouragement = () => {
  const messages = [
    "Great job! Keep it up! 🚀",
    "You're on fire! 🔥",
    "Another step closer to your goals! 🎯",
    "Consistency is key! 🔑",
    "Amazing work today! 🌟",
    "You're doing fantastic! 💪",
    "Small steps lead to big results! 📈",
    "You're making progress! 🏁",
    "Keep pushing forward! ⏩",
    "You've got this! ✨"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
