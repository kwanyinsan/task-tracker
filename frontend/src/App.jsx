import { useEffect, useState } from 'react';
import { tasksApi } from './api/tasks.js';
import TaskForm from './components/TaskForm.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import TaskList from './components/TaskList.jsx';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const isBusy = isLoading || isSaving;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadTasks() {
      try {
        const data = await tasksApi.getTasks({
          category: selectedCategory,
          signal: controller.signal,
        });

        if (!Array.isArray(data)) {
          throw new Error('The task API did not return a task array.');
        }

        if (active) {
          setTasks(data);
        }
      } catch (requestError) {
        if (active && requestError.name !== 'AbortError') {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedCategory, reloadKey]);

  async function handleCreateTask(values) {
    if (isBusy) {
      return false;
    }

    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      const createdTask = await tasksApi.createTask(values);

      if (
        selectedCategory === 'All' ||
        createdTask.category === selectedCategory
      ) {
        setTasks((currentTasks) => [createdTask, ...currentTasks]);
        setNotice('Task added.');
      } else {
        setNotice('Task added. Select All or its category to see it.');
      }

      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCompleteTask(id) {
    if (isBusy) {
      return;
    }

    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      const updatedTask = await tasksApi.completeTask(id);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      setNotice('Task marked completed.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTask(id) {
    if (isBusy) {
      return;
    }

    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      await tasksApi.deleteTask(id);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );

      setNotice('Task deleted.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCategoryChange(category) {
    if (isBusy || category === selectedCategory) {
      return;
    }

    setTasks([]);
    setError('');
    setNotice('');
    setIsLoading(true);
    setSelectedCategory(category);
  }

  function handleReloadTasks() {
    if (isBusy) {
      return;
    }

    setTasks([]);
    setError('');
    setNotice('');
    setIsLoading(true);
    setReloadKey((currentKey) => currentKey + 1);
  }

  return (
    <main className="app" aria-busy={isBusy}>
      <h1>Task Tracker</h1>
      <p>Manage Work and Personal tasks.</p>

      <TaskForm
        onCreate={handleCreateTask}
        disabled={isBusy}
      />

      <CategoryFilter
        value={selectedCategory}
        onChange={handleCategoryChange}
        disabled={isBusy}
      />

      <p>
        <button
          type="button"
          onClick={handleReloadTasks}
          disabled={isBusy}
        >
          Reload tasks
        </button>
      </p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p role="status">
          {notice}
        </p>
      )}

      {isLoading && (
        <p role="status">
          Loading tasks...
        </p>
      )}

      {isSaving && (
        <p role="status">
          Saving change...
        </p>
      )}

      {!isLoading && tasks.length > 0 && (
        <TaskList
          tasks={tasks}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          disabled={isBusy}
        />
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <p>No tasks match the current filter.</p>
      )}
    </main>
  );
}