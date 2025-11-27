from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, CreateView, DeleteView
from django.urls import reverse_lazy
from .models import Task


class TaskListView(ListView):
    model = Task
    template_name = 'core/home.html'
    context_object_name = 'tasks'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['pending_tasks'] = Task.objects.filter(completed=False)
        context['completed_tasks'] = Task.objects.filter(completed=True)
        return context


class TaskCreateView(CreateView):
    model = Task
    fields = ['title', 'description', 'priority', 'due_date']
    success_url = reverse_lazy('task_list')

    def form_valid(self, form):
        return super().form_valid(form)


def task_toggle(request, pk):
    task = get_object_or_404(Task, pk=pk)
    task.completed = not task.completed
    task.save()
    return redirect('task_list')


class TaskDeleteView(DeleteView):
    model = Task
    success_url = reverse_lazy('task_list')

    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)
