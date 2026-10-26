import ValidateEmail, { ValidatePhoneNumber }  from '@utils/validate-util';

export const HashString = (data:string) =>{
    if (!data)
        return '****'
    if (data.length < 4)
        return '****'
    if (data.length > 30){
        const newdata = data[0]+data[1]+data[2]+data[3]+('*'.repeat(5))+data[data.length-2]+data[data.length-1]
        return  newdata
    }
    if (ValidateEmail(data)){
        const temp = data.split('@')
        const newdata = temp[0][0]+('*'.repeat(temp[0].length-2))+temp[0][temp[0].length-1]+'@'+temp[1]
        return newdata
    } 
    else if(ValidatePhoneNumber(data)){
        const newdata = data[0]+data[1]+data[2]+data[3]+('*'.repeat(data.length-6))+data[data.length-2]+data[data.length-1]
        return newdata
    }
    else{
        const newdata = data[0]+('*'.repeat(data.length-3))+data[data.length-2]+data[data.length-1]
        return newdata
    }
}
