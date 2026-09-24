const modalBackdrops = document.querySelectorAll('.modal-backdrop');

const openModal = (id) => {
  const modal = document.getElementById(id);
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modal.querySelector('input, textarea, select').focus();
};

const closeModal = (modal) => {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
};

document.querySelectorAll('[data-modal]').forEach((button) => {
  button.addEventListener('click', () => openModal(button.dataset.modal));
});

document.querySelectorAll('.modal-close').forEach((button) => {
  button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop')));
});

document.querySelectorAll('[data-switch]').forEach((button) => {
  button.addEventListener('click', () => {
    closeModal(button.closest('.modal-backdrop'));
    openModal(button.dataset.switch);
  });
});

modalBackdrops.forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const open = document.querySelector('.modal-backdrop.is-open');
    if (open) closeModal(open);
  }
});

document.querySelector('[data-form="register"]').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const users = JSON.parse(localStorage.getItem('traveller-users') || '[]');
  const message = form.querySelector('.form-message');

  if (users.some((user) => user.email === data.email)) {
    message.textContent = 'Email này đã được đăng ký. Hãy đăng nhập nhé.';
    message.className = 'form-message error';
    return;
  }

  users.push(data);
  localStorage.setItem('traveller-users', JSON.stringify(users));
  message.textContent = 'Đăng ký thành công! Chào mừng bạn đến với Traveller Team.';
  message.className = 'form-message success';
  form.reset();
});

document.querySelector('[data-form="login"]').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const users = JSON.parse(localStorage.getItem('traveller-users') || '[]');
  const user = users.find((item) => item.email === data.email && item.password === data.password);
  const message = form.querySelector('.form-message');

  message.textContent = user
    ? `Xin chào ${user.name}! Bạn đã đăng nhập thành công.`
    : 'Email hoặc mật khẩu chưa chính xác.';
  message.className = `form-message ${user ? 'success' : 'error'}`;
  if (user) form.reset();
});

document.querySelector('[data-form="contact"]').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');

  form.reset();
  message.textContent = 'Đã nhận được lời nhắn. Traveller Team sẽ phản hồi bạn sớm nhất!';
  message.className = 'form-message success';
});
