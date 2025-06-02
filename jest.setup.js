// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock next-auth (only if needed)
// jest.mock('next-auth/react', () => ({
//   useSession: jest.fn(() => ({
//     data: null,
//     status: 'unauthenticated',
//   })),
//   signIn: jest.fn(),
//   signOut: jest.fn(),
//   getSession: jest.fn(() => Promise.resolve(null)),
// }));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
);

// Mock GSAP for cursor testing
global.gsap = {
  registerPlugin: jest.fn(),
  set: jest.fn(),
  to: jest.fn(() => ({ kill: jest.fn() })),
  fromTo: jest.fn(() => ({ kill: jest.fn() })),
  timeline: jest.fn(() => ({
    to: jest.fn(),
    fromTo: jest.fn(),
    kill: jest.fn(),
    clear: jest.fn(),
  })),
  killTweensOf: jest.fn(),
  ticker: {
    add: jest.fn(),
    remove: jest.fn(),
  },
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
};

// Mock CSS.supports
global.CSS = { supports: jest.fn(() => true) };

// Mock touch and pointer events
global.TouchEvent = class TouchEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.touches = options.touches || [];
    this.targetTouches = options.targetTouches || [];
    this.changedTouches = options.changedTouches || [];
  }
};

global.PointerEvent = class PointerEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.pointerId = options.pointerId || 1;
    this.pointerType = options.pointerType || 'mouse';
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  if (global.gsap && global.gsap.killTweensOf) {
    global.gsap.killTweensOf('*');
  }
});
