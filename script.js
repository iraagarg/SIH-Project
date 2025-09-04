const userLoginBtn = document.getElementById('userLoginBtn');
    const managerLoginBtn = document.getElementById('managerLoginBtn');
    const loginForm = document.getElementById('loginForm');

    function setActiveButton(activeBtn) {
      if (activeBtn === 'user') {
        userLoginBtn.classList.add('active');
        managerLoginBtn.classList.remove('active');
      } else {
        managerLoginBtn.classList.add('active');
        userLoginBtn.classList.remove('active');
      }
    }

    userLoginBtn.addEventListener('click', () => {
      setActiveButton('user');
    });

    managerLoginBtn.addEventListener('click', () => {
      setActiveButton('manager');
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();
      if(username && password){
        alert(`Logging in as ${userLoginBtn.classList.contains('active') ? 'User' : 'Manager'}: ${username}`);
      } else {
        alert('Please enter username and password');
      }
    });