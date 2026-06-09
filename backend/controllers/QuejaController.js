export const CreateQueja = async (req,res)=>{

    try{

        const data = req.body

        console.log("Queja recibida:")
        console.log(data)

        return res.status(200).json({

            success:true,
            message:"Datos recibidos correctamente",
            data:data

        })

    }catch(error){

        console.log(error)

        return res.status(500).json({

            success:false,
            message:"Error interno"

        })

    }

}

