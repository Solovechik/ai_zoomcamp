import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StreakBadge from '../components/StreakBadge'
import HabitCard from '../components/HabitCard'
import HabitList from '../components/HabitList'
import StatsPanel from '../components/StatsPanel'

// Wrapper for components that need Router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('StreakBadge', () => {
  it('should not render when streak is 0', () => {
    const { container } = render(<StreakBadge streak={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render streak count', () => {
    render(<StreakBadge streak={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should render fire emoji', () => {
    render(<StreakBadge streak={10} />)
    expect(screen.getByText('🔥')).toBeInTheDocument()
  })

  it('should apply warm class for 7+ days', () => {
    const { container } = render(<StreakBadge streak={7} />)
    expect(container.firstChild).toHaveClass('streak-warm')
  })

  it('should apply hot class for 30+ days', () => {
    const { container } = render(<StreakBadge streak={30} />)
    expect(container.firstChild).toHaveClass('streak-hot')
  })

  it('should apply legendary class for 100+ days', () => {
    const { container } = render(<StreakBadge streak={100} />)
    expect(container.firstChild).toHaveClass('streak-legendary')
  })

  it('should apply size classes correctly', () => {
    const { container: small } = render(<StreakBadge streak={5} size="small" />)
    expect(small.firstChild).toHaveClass('streak-badge-sm')

    const { container: large } = render(<StreakBadge streak={5} size="large" />)
    expect(large.firstChild).toHaveClass('streak-badge-lg')
  })
})

describe('HabitCard', () => {
  const mockHabit = {
    id: 1,
    name: 'Test Habit',
    description: 'Test description',
    color: '#22c55e',
    icon: 'fire',
    completedToday: false,
    currentStreak: 5
  }

  it('should render habit name', () => {
    render(
      <RouterWrapper>
        <HabitCard habit={mockHabit} onToggle={() => {}} />
      </RouterWrapper>
    )
    expect(screen.getByText('Test Habit')).toBeInTheDocument()
  })

  it('should render habit description', () => {
    render(
      <RouterWrapper>
        <HabitCard habit={mockHabit} onToggle={() => {}} />
      </RouterWrapper>
    )
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render streak badge', () => {
    render(
      <RouterWrapper>
        <HabitCard habit={mockHabit} onToggle={() => {}} />
      </RouterWrapper>
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should call onToggle when toggle button clicked', () => {
    const onToggle = vi.fn()
    render(
      <RouterWrapper>
        <HabitCard habit={mockHabit} onToggle={onToggle} />
      </RouterWrapper>
    )

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)
    expect(onToggle).toHaveBeenCalledWith(1)
  })

  it('should show check mark when completed', () => {
    const completedHabit = { ...mockHabit, completedToday: true }
    render(
      <RouterWrapper>
        <HabitCard habit={completedHabit} onToggle={() => {}} />
      </RouterWrapper>
    )
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('should apply habit color to border', () => {
    const { container } = render(
      <RouterWrapper>
        <HabitCard habit={mockHabit} onToggle={() => {}} />
      </RouterWrapper>
    )
    const card = container.querySelector('.habit-card')
    expect(card).toHaveStyle({ borderLeftColor: '#22c55e' })
  })
})

describe('HabitList', () => {
  const mockHabits = [
    {
      id: 1,
      name: 'Habit 1',
      description: 'Desc 1',
      color: '#22c55e',
      icon: 'fire',
      completedToday: false,
      currentStreak: 3
    },
    {
      id: 2,
      name: 'Habit 2',
      description: 'Desc 2',
      color: '#3b82f6',
      icon: 'star',
      completedToday: true,
      currentStreak: 10
    }
  ]

  it('should render loading state', () => {
    render(
      <RouterWrapper>
        <HabitList habits={[]} onToggle={() => {}} loading={true} />
      </RouterWrapper>
    )
    expect(screen.getByText('Loading habits...')).toBeInTheDocument()
  })

  it('should render empty state', () => {
    render(
      <RouterWrapper>
        <HabitList habits={[]} onToggle={() => {}} loading={false} />
      </RouterWrapper>
    )
    expect(screen.getByText(/No habits yet/)).toBeInTheDocument()
  })

  it('should render all habits', () => {
    render(
      <RouterWrapper>
        <HabitList habits={mockHabits} onToggle={() => {}} loading={false} />
      </RouterWrapper>
    )
    expect(screen.getByText('Habit 1')).toBeInTheDocument()
    expect(screen.getByText('Habit 2')).toBeInTheDocument()
  })
})

describe('StatsPanel', () => {
  const mockStats = {
    currentStreak: 7,
    longestStreak: 14,
    totalCompletions: 50,
    completionRate: 85.5
  }

  it('should render current streak', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('Current Streak')).toBeInTheDocument()
  })

  it('should render longest streak', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('Longest Streak')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
  })

  it('should render total completions', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('Total Completions')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('should render completion rate with percentage', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('85.5%')).toBeInTheDocument()
  })

  it('should handle empty stats gracefully', () => {
    render(<StatsPanel stats={null} />)
    // Should render without crashing and show default zeros
    expect(screen.getByText('Current Streak')).toBeInTheDocument()
    expect(screen.getByText('Longest Streak')).toBeInTheDocument()
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })
})
