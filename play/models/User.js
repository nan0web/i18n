export default class User {
  static properties = {
    username: {
      label: 'Username',
      placeholder: 'Enter your username',
      errorNotFound: 'User is not found in the system',
      errorInvalid: 'Username must be at least 3 characters',
      error_api_failure: 'Internal server error while verifying',
      help: 'Please provide a unique username'
    },
    role: {
      label: 'Role',
      value: 'guest',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Guest', value: 'guest' }
      ]
    }
  }
}
