function TaskItem({ task, onComplete, onDelete, disabled }) {
  return (
    <li className="task-item">
      <label className="completion-control">
        <input
          type="checkbox"
          className="completion-checkbox"
          checked={task.completed}
          disabled={disabled || task.completed || !onComplete}
          onChange={() => onComplete?.(task.id)}
          aria-label={
            task.completed
              ? `${task.title} completed`
              : `Mark ${task.title} completed`
          }
        />
      </label>

      <div className="task-details">
        <p
          className={
            task.completed
              ? 'task-title completed'
              : 'task-title'
          }
        >
          {task.title}
        </p>

        <p className="task-meta">
          {task.category} · {task.completed ? 'Completed' : 'Pending'}
        </p>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="delete-button"
          disabled={disabled || !onDelete}
          onClick={() => onDelete?.(task.id)}
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function TaskList({
  tasks,
  onComplete,
  onDelete,
  disabled,
}) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks match the current filter.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          disabled={disabled}
        />
      ))}
    </ul>
  );
}
