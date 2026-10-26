const ValidateEmail = (email:string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    };
export default ValidateEmail

export const ValidatePhoneNumber = (phone:string) => {
    return String(phone)
      .toLowerCase()
      .match(
        /^[\+]?([0-9][\s]?|[0-9]?)([(][0-9]{3}[)][\s]?|[0-9]{3}[-\s\.]?)[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
      );
  };

 export const ValidatePassword = (password:string) => {
    return String(password)
      .match(
        /^[a-zA-Z0-9!@#$%^&*)_(&]{8,15}$/
      );
  };

  