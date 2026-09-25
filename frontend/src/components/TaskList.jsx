function TaskItem({ task, onComplete, onDelete, disabled }) {
  return (
    <li className="task-item">
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
          disabled={disabled || task.completed || !onComplete}
          onClick={() => onComplete?.(task.id)}
          aria-label={`Mark ${task.title} completed`}
        >
          {task.completed ? 'Completed' : 'Mark completed'}
        </button>

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
    return <p>No tasks match the current filter.</p>;
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