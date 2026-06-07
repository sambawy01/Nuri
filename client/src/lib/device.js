/**
 * Generate or retrieve a persistent device ID.
 * Each device gets a unique ID stored in localStorage.
 * This ensures profiles are scoped to the device that created them.
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem('nuri_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() :
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    localStorage.setItem('nuri_device_id', deviceId);
  }
  return deviceId;
}
