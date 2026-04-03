import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const {token} = req.cookies || {};
    if (!token) {
        return res.json({ success: false, message: "Unauthorized.Login again" });
    }

    try{
        const tokenDecode=jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            
                req.userId= tokenDecode.id
            }
            else{
                return res.json({ success: false, message: "Unauthorized.Login again" });
            }
            next();

    }catch(error){
        return res.json({ success: false, message: "Unauthorized" });
    }
}

export default userAuth;