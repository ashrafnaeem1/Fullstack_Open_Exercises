const Notification = ({ message, status }) => {
  if (message === null) {
    return null;
  }

  // prettier-ignore
  return (status === "error")
          ?<div className="error">{message}</div>
          :(status === "success")
            ?<div className="success">{message}</div>
            :console.log(`recieved message: \n{"${message}"}\n[NOT DISPLAYING]`,
              `\nReason: status="${status}"`,
              `\nThis is fine if only intended to log the message silently to console.`,
              `\nHowever, use status="error" or status="success" to display error or`,
              `success status to the user directly via the webpage.`
            );
};

export default Notification;
