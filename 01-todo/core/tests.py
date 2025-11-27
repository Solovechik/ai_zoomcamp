from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from .models import Task


class TaskModelTests(TestCase):
    """Test cases for the Task model"""

    def test_create_task_with_all_fields(self):
        """Test creating a task with all fields"""
        due_date = timezone.now() + timezone.timedelta(days=1)
        task = Task.objects.create(
            title="Test Task",
            description="Test Description",
            priority="high",
            due_date=due_date
        )
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.description, "Test Description")
        self.assertEqual(task.priority, "high")
        self.assertEqual(task.due_date, due_date)
        self.assertFalse(task.completed)

    def test_create_task_with_minimal_fields(self):
        """Test creating a task with only required field (title)"""
        task = Task.objects.create(title="Minimal Task")
        self.assertEqual(task.title, "Minimal Task")
        self.assertIsNone(task.description)
        self.assertFalse(task.completed)

    def test_task_default_values(self):
        """Test that default values are set correctly"""
        task = Task.objects.create(title="Default Task")
        self.assertFalse(task.completed)
        self.assertEqual(task.priority, "medium")
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

    def test_task_string_representation(self):
        """Test the __str__ method returns task title"""
        task = Task.objects.create(title="String Test Task")
        self.assertEqual(str(task), "String Test Task")

    def test_task_ordering(self):
        """Test that tasks are ordered by created_at descending"""
        task1 = Task.objects.create(title="First Task")
        task2 = Task.objects.create(title="Second Task")
        task3 = Task.objects.create(title="Third Task")

        tasks = Task.objects.all()
        self.assertEqual(tasks[0], task3)
        self.assertEqual(tasks[1], task2)
        self.assertEqual(tasks[2], task1)


class TaskViewTests(TestCase):
    """Test cases for Task views"""

    def setUp(self):
        """Create test data before each test"""
        self.pending_task = Task.objects.create(
            title="Pending Task",
            description="This is pending",
            priority="high"
        )
        self.completed_task = Task.objects.create(
            title="Completed Task",
            description="This is completed",
            completed=True
        )

    def test_task_list_view_status_code(self):
        """Test that task list view returns 200 status"""
        response = self.client.get(reverse('task_list'))
        self.assertEqual(response.status_code, 200)

    def test_task_list_view_uses_correct_template(self):
        """Test that task list view uses the correct template"""
        response = self.client.get(reverse('task_list'))
        self.assertTemplateUsed(response, 'core/home.html')

    def test_task_list_view_contains_tasks(self):
        """Test that task list view displays tasks"""
        response = self.client.get(reverse('task_list'))
        self.assertContains(response, "Pending Task")
        self.assertContains(response, "Completed Task")

    def test_task_list_separates_pending_and_completed(self):
        """Test that pending and completed tasks are separated"""
        response = self.client.get(reverse('task_list'))
        self.assertEqual(len(response.context['pending_tasks']), 1)
        self.assertEqual(len(response.context['completed_tasks']), 1)
        self.assertEqual(response.context['pending_tasks'][0], self.pending_task)
        self.assertEqual(response.context['completed_tasks'][0], self.completed_task)

    def test_create_task_view_post(self):
        """Test creating a new task via POST"""
        task_count_before = Task.objects.count()
        response = self.client.post(reverse('task_create'), {
            'title': 'New Test Task',
            'description': 'New Description',
            'priority': 'low'
        })
        self.assertEqual(Task.objects.count(), task_count_before + 1)
        new_task = Task.objects.latest('created_at')
        self.assertEqual(new_task.title, 'New Test Task')
        self.assertEqual(new_task.description, 'New Description')
        self.assertEqual(new_task.priority, 'low')

    def test_create_task_view_redirects(self):
        """Test that create task view redirects after successful creation"""
        response = self.client.post(reverse('task_create'), {
            'title': 'Redirect Test Task',
            'priority': 'medium'
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('task_list'))

    def test_toggle_task_completion(self):
        """Test toggling task completion status"""
        self.assertFalse(self.pending_task.completed)
        response = self.client.post(reverse('task_toggle', args=[self.pending_task.pk]))
        self.pending_task.refresh_from_db()
        self.assertTrue(self.pending_task.completed)

    def test_toggle_completed_task_back_to_pending(self):
        """Test toggling completed task back to pending"""
        self.assertTrue(self.completed_task.completed)
        response = self.client.post(reverse('task_toggle', args=[self.completed_task.pk]))
        self.completed_task.refresh_from_db()
        self.assertFalse(self.completed_task.completed)

    def test_toggle_task_redirects(self):
        """Test that toggle view redirects to task list"""
        response = self.client.post(reverse('task_toggle', args=[self.pending_task.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('task_list'))

    def test_delete_task_view(self):
        """Test deleting a task"""
        task_count_before = Task.objects.count()
        task_pk = self.pending_task.pk
        response = self.client.post(reverse('task_delete', args=[task_pk]))
        self.assertEqual(Task.objects.count(), task_count_before - 1)
        self.assertFalse(Task.objects.filter(pk=task_pk).exists())

    def test_delete_task_redirects(self):
        """Test that delete view redirects to task list"""
        response = self.client.post(reverse('task_delete', args=[self.pending_task.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('task_list'))

    def test_create_task_without_required_field(self):
        """Test that creating task without title fails"""
        task_count_before = Task.objects.count()
        response = self.client.post(reverse('task_create'), {
            'description': 'No title',
            'priority': 'low'
        })
        self.assertEqual(Task.objects.count(), task_count_before)


class TaskURLTests(TestCase):
    """Test cases for URL routing"""

    def test_task_list_url_resolves(self):
        """Test that task list URL resolves correctly"""
        url = reverse('task_list')
        self.assertEqual(url, '/')

    def test_task_create_url_resolves(self):
        """Test that task create URL resolves correctly"""
        url = reverse('task_create')
        self.assertEqual(url, '/task/create/')

    def test_task_toggle_url_resolves(self):
        """Test that task toggle URL resolves correctly"""
        url = reverse('task_toggle', args=[1])
        self.assertEqual(url, '/task/1/toggle/')

    def test_task_delete_url_resolves(self):
        """Test that task delete URL resolves correctly"""
        url = reverse('task_delete', args=[1])
        self.assertEqual(url, '/task/1/delete/')
