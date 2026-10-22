export const getUserId = () => {
  let userId = localStorage.getItem('app_user_id');

  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    localStorage.setItem('app_user_id', userId);
  }

  return userId;
};