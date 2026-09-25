import { useState } from 'react';

export default function TaskForm({ onCreate, disabled }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [validationError, setValidationError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      setValidationError(
        'Title must contain between 1 and 200 characters.'
      );
      return;
    }

    if (!['Work', 'Personal'].includes(category)) {
      setValidationError('Category must be Work or Personal.');
      return;
    }

    setValidationError('');

    const created = await onCreate({
      title: trimmedTitle,
      category,
    });

    if (created) {
      setTitle('');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="task-title">Task title</label>

        <input
          id="task-title"
          type="text"
          value={title}
          maxLength={200}
          disabled={disabled}
          onChange={(event) => {
            setTitle(event.target.value);
            setValidationError('');
          }}
        />
      </div>

      <div className="field">
        <label htmlFor="task-category">Category</label>

        <select
          id="task-category"
          value={category}
          disabled={disabled}
          onChange={(event) => {
            setCategory(event.target.value);
            setValidationError('');
          }}
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      {validationError && (
        <p className="error" role="alert">
          {validationError}
        </p>
      )}

      <button type="submit" disabled={disabled}>
        Add Task
      </button>
    </form>
  );
}