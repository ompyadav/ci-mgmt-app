# CIMS Frontend Setup Guide

## 📋 Overview

This guide provides instructions for setting up and running the CIMS React frontend application.

---

## 🛠️ Technology Stack

### Core Technologies
- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool and dev server
- **React Router 6.21** - Client-side routing

### State Management & Data Fetching
- **Zustand 4.4** - Lightweight state management
- **TanStack Query 5.14** - Server state management
- **Axios 1.6** - HTTP client

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts 2.10** - Charts and data visualization

### Forms & Validation
- **React Hook Form 7.49** - Form management
- **Zod 3.22** - Schema validation
- **@hookform/resolvers** - Form validation integration

### PWA Support
- **Vite PWA Plugin 0.17** - Progressive Web App support
- **Workbox 7.0** - Service worker management

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── pwa-192x192.png    # PWA icon (192x192)
│   ├── pwa-512x512.png    # PWA icon (512x512)
│   └── manifest.json      # PWA manifest
├── src/
│   ├── api/               # API client and services
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Common components (Button, Input, etc.)
│   │   ├── layout/       # Layout components (Header, Sidebar, etc.)
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── ideas/        # Idea management pages
│   │   ├── users/        # User management pages
│   │   └── notifications/ # Notification pages
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Application Configuration
VITE_APP_NAME=CIMS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
```

### Vite Configuration

The `vite.config.ts` includes:
- React plugin for Fast Refresh
- PWA plugin for offline support
- Path aliases (`@/` → `./src/`)
- API proxy to backend (port 8080)
- Code splitting for optimized bundles

### Tailwind Configuration

Custom theme in `tailwind.config.js`:
- Primary color palette (blue)
- Secondary color palette (gray)
- Custom font family (Inter)
- Soft shadow utilities
- Responsive breakpoints

---

## 🎨 Styling Guidelines

### Tailwind CSS Classes

Use utility classes for styling:

```tsx
// Button example
<button className="btn btn-primary">
  Click Me
</button>

// Card example
<div className="card">
  <div className="card-header">
    <h2>Title</h2>
  </div>
  <p>Content</p>
</div>

// Input example
<input 
  type="text" 
  className="input"
  placeholder="Enter text"
/>
```

### Custom Components

Predefined component classes in `index.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-outline`
- `.input`, `.input-error`
- `.card`, `.card-header`
- `.badge`, `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-danger`
- `.table`, `.table thead`, `.table th`, `.table td`
- `.alert`, `.alert-success`, `.alert-error`, `.alert-warning`, `.alert-info`
- `.spinner`

---

## 🔐 Authentication Flow

### Login Process
1. User enters credentials
2. Frontend sends POST to `/api/auth/login`
3. Backend returns JWT tokens
4. Store tokens in localStorage/sessionStorage
5. Set Authorization header for subsequent requests
6. Redirect to dashboard

### Token Management
- Access token: Short-lived (24 hours)
- Refresh token: Long-lived (7 days)
- Auto-refresh before expiration
- Logout clears all tokens

### Protected Routes
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/ideas" element={<Ideas />} />
  {/* Other protected routes */}
</Route>
```

---

## 📡 API Integration

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);
```

### API Services

```typescript
// src/api/services/ideaService.ts
export const ideaService = {
  getAll: () => apiClient.get('/ideas'),
  getById: (id: number) => apiClient.get(`/ideas/${id}`),
  create: (data: IdeaRequest) => apiClient.post('/ideas', data),
  update: (id: number, data: IdeaRequest) => 
    apiClient.put(`/ideas/${id}`, data),
  delete: (id: number) => apiClient.delete(`/ideas/${id}`),
  submit: (id: number) => apiClient.post(`/ideas/${id}/submit`),
  approve: (id: number, comments: string) => 
    apiClient.post(`/ideas/${id}/approve`, { comments }),
  reject: (id: number, reason: string) => 
    apiClient.post(`/ideas/${id}/reject`, { reason }),
};
```

---

## 🗂️ State Management

### Zustand Store Example

```typescript
// src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: Tokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));
```

### TanStack Query Usage

```typescript
// src/hooks/useIdeas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useIdeas = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => ideaService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: ideaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });

  return { ideas: data, isLoading, createIdea: createMutation.mutate };
};
```

---

## 📱 Progressive Web App (PWA)

### Features
- ✅ Offline support
- ✅ Install to home screen
- ✅ Background sync
- ✅ Push notifications (future)
- ✅ App-like experience

### Service Worker

Automatically generated by Vite PWA plugin:
- Caches static assets
- Network-first strategy for API calls
- Automatic updates

### Testing PWA

1. Build production version: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Service Workers
4. Test offline mode

---

## 🧪 Testing (Future Implementation)

### Unit Tests
```bash
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### E2E Tests
```bash
npm run test:e2e          # Run E2E tests
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Docker Deployment

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-Specific Builds

```bash
# Development
npm run build -- --mode development

# Staging
npm run build -- --mode staging

# Production
npm run build -- --mode production
```

---

## 🔍 Troubleshooting

### Common Issues

**1. Port 3000 already in use**
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

**2. API connection refused**
- Ensure backend is running on port 8080
- Check VITE_API_BASE_URL in .env
- Verify proxy configuration in vite.config.ts

**3. TypeScript errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. Build fails**
```bash
# Check for TypeScript errors
npm run lint
# Fix and rebuild
npm run build
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Test changes
6. Submit pull request

---

**Last Updated**: 2026-06-10  
**Version**: 1.0.0  
**Status**: 🟢 In Development