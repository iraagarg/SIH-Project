document.addEventListener("DOMContentLoaded", () => {
  const getStartedBtn = document.querySelector(".get-started-btn");
  const loginBtn = document.querySelector(".login-button");
  const signupBtn = document.querySelector(".signup-button");
  const loginContainer = document.querySelector(".login-container");
  const signupContainer = document.querySelector(".signup-container");
  const buttonContainer = document.querySelector(".button-container");
  const goToSignup = document.querySelector(".go-to-signup");
  const goToLogin = document.querySelector(".go-to-login");
  const closeBtns = document.querySelectorAll(".close-btn");
  const overlayBg = document.querySelector(".overlay-bg");

  // Show login/signup buttons
  getStartedBtn.addEventListener("click", () => {
    buttonContainer.style.display = "flex";
    getStartedBtn.style.display = "none";
  });

  // Show login overlay
  loginBtn.addEventListener("click", () => {
    loginContainer.style.display = "flex";
    signupContainer.style.display = "none";
    overlayBg.style.display = "block";
  });

  // Show signup overlay
  signupBtn.addEventListener("click", () => {
    signupContainer.style.display = "flex";
    loginContainer.style.display = "none";
    overlayBg.style.display = "block";
  });

  // Switch to signup
  goToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "flex";
  });

  // Switch to login
  goToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "flex";
  });

  // Close forms
  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      loginContainer.style.display = "none";
      signupContainer.style.display = "none";
      overlayBg.style.display = "none";
    });
  });

  // Close if click on background
  overlayBg.addEventListener("click", () => {
    loginContainer.style.display = "none";
    signupContainer.style.display = "none";
    overlayBg.style.display = "none";
  });
});
