import Swal from 'sweetalert2';
import './SingleButtonAlert.css';

const SingleButtonAlert = (message) => {
  return Swal.fire({
    title: '알림',
    html: `<div class="swal-text">${message}</div>`,
    confirmButtonText: '확인',
    customClass: {
      popup: 'my-swal-popup',
      title: 'my-swal-title',
      confirmButton: 'my-swal-confirm-button'
    },
    buttonsStyling: false
  });
};

export default SingleButtonAlert;