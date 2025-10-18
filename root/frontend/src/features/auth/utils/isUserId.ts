const userIdRegex = new RegExp("^[0-9]{8}$");

export default function isUserId(userId: string) {
  return userIdRegex.test(userId);
}
