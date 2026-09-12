type Listener = (pending: number, label: string) => void;

const listeners = new Set<Listener>();
let pending = 0;

export function subscribeApiActivity(listener: Listener) {
  listeners.add(listener);
  listener(pending, '');
  return () => {
    listeners.delete(listener);
  };
}

export function beginApiActivity(label = 'Working') {
  pending += 1;
  listeners.forEach((fn) => fn(pending, label));
}

export function endApiActivity() {
  pending = Math.max(0, pending - 1);
  listeners.forEach((fn) => fn(pending, ''));
}

export function apiPendingCount() {
  return pending;
}
