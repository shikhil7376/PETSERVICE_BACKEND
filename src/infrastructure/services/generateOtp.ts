import OtpRepo from "../../useCase/interface/otp";


class GenerateOtp implements OtpRepo{
    createOtp(): number {
        return Math.floor(100000 + Math.random() * 900000)
    }
}

export default GenerateOtp