import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries';

const LoginForm = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      props.setError(error.message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      props.setToken(token);
      localStorage.setItem('user-token', token);
      
      // Call the handleLogin function from props to indicate successful login
      props.handleLogin();
    }
  }, [result.data, props]); // eslint-disable-line

  const submit = (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
  };

  if (!props.show) {
    return null;
  }

  return (
    <form onSubmit={submit}>
      <label>
        username:
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <label>
        password:
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit">login</button>
    </form>
  );
};

export default LoginForm;
