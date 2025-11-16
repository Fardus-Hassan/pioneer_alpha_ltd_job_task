import Swal from "sweetalert2";

type SuccessOptions = {
  title?: string;
  text?: string;
  html?: string;
  timer?: number;
};

export const showSuccess = async ({
  title = "Success!",
  text,
  html,
  timer = 2000,
}: SuccessOptions) => {
  const content = html ?? `
    <div style="padding: 10px 0;">
      <p style="font-size: 16px; color: #374151;">${text ?? "Operation successful!"}</p>
    </div>
  `;

  return Swal.fire({
    title,
    html: content,
    icon: "success",
    iconColor: "#10b981",
    confirmButtonColor: "#5272FF",
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};

export default showSuccess;
