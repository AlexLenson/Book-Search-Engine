const { User } =require('../models')
const { signToken, AuthenticationError } = require('../utils/auth')

const resolvers={
    Query:{
        me: async(parent, args, context)=>{
            if(context.user){
                const userData= await User.findOne({_id: context.user._id})
                return userData
            }
            throw AuthenticationError
        }
    },

    Mutation:{
        addUser: async(parent, args)=>{
            const user= await User.create(args)
            const token= signToken(user)
            return { token, user }
        },

        login: async (parent,{email, password})=>{
            const userData = await User.findOne({email})

            if(!userData){
                throw AuthenticationError
            }

            const validPw= await userData.isCorrectPassword(password)

            if(!validPw){
                throw AuthenticationError
            }

            const token = signToken(userData)
            return { token, userData }
        },

        saveBook: async (parent, {bookData}, context)=>{
            if(context.user){
                const userData= await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    { $push:{savedBooks: bookData}},
                    {new: true}
                )

                return userData;
            }
            throw AuthenticationError
        },
        removeBook: async (parent, {bookId}, context)=>{
            if(context.user){
                const userData = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: {bookId} } },
                    { new: true }
                )
                return userData;
            }
            throw AuthenticationError
        }
    }
}

module.exports=resolvers;