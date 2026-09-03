import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { appRoutes } from '@/router';

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('parts routing', () => {
  it('renders Welcome at /', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Petclinic');
  });

  it('renders Welcome at /welcome', () => {
    renderAt('/welcome');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Petclinic');
  });

  it('renders PageNotFound for unknown paths inside the shared layout', () => {
    renderAt('/does/not/exist');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Oops! Page not found !');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Not Found - 404 error');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
