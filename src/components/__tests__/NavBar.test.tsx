import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../NavBar';

function renderNavBar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>,
  );
}

describe('NavBar', () => {
  it('renders every Angular nav link with the same targets', () => {
    renderNavBar();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/welcome');
    expect(screen.getByRole('link', { name: /pet types/i })).toHaveAttribute('href', '/pettypes');
    expect(screen.getByRole('link', { name: /specialties/i })).toHaveAttribute('href', '/specialties');

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/welcome', '/owners', '/owners/add', '/vets', '/vets/add', '/pettypes', '/specialties']);
  });

  it('marks the active NavLink', () => {
    renderNavBar('/pettypes');
    expect(screen.getByRole('link', { name: /pet types/i })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /specialties/i })).not.toHaveClass('active');
  });

  it('toggles dropdowns open and closed', async () => {
    renderNavBar();
    const owners = screen.getByRole('button', { name: /owners/i });
    expect(owners).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(owners);
    expect(owners).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(owners);
    expect(owners).toHaveAttribute('aria-expanded', 'false');
  });
});
