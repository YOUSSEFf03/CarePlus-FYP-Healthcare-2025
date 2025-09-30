const API_BASE_URL = 'http://192.168.50.176:3000';

export const testConnection = async () => {
  try {
    console.log('Testing connection to:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123',
        phone: '+1234567890',
        role: 'patient',
        date_of_birth: '1990-01-01',
        gender: 'male'
      }),
    });

    console.log('Test response status:', response.status);
    const data = await response.text();
    console.log('Test response data:', data);
    
    return {
      success: true,
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
