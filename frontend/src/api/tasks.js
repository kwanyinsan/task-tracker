async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`/api${path}`, {
      cache: 'no-store',
      ...options,
      headers: {
        ...(options.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error('Cannot reach the API. Check the running servers.');
  }

  if (response.status === 204) {
    return null;
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error(
      `Unexpected API response (HTTP ${response.status}). Check the backend and proxy.`
    );
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string'
        ? data.error
        : `Request failed with HTTP ${response.status}.`
    );
  }

  return data;
}

export const tasksApi = {
  getTasks({ category = 'All', signal } = {}) {
    const query = category === 'All'
      ? ''
      : `?category=${encodeURIComponent(category)}`;

    return request(`/tasks${query}`, { signal });
  },

  createTask(values) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(values),
    });
  },

  completeTask(id) {
    return request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    });
  },

  deleteTask(id) {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};