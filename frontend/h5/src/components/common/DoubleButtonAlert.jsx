import Swal from 'sweetalert2';
import './DoubleButtonAlert.css';

const DoubleButtonAlert = (message) => {
  return Swal.fire({
    title: '알림',
    html: `<div class="swal-text">${message}</div>`,
    showCancelButton: true,
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    customClass: {
      container: 'my-swal-container', // container 클래스 추가
      popup: 'my-swal-popup',
      title: 'my-swal-title',
      confirmButton: 'my-swal-confirm-button',
      cancelButton: 'my-swal-cancel-button'
    },
    buttonsStyling: false
  });
};

export default DoubleButtonAlert;