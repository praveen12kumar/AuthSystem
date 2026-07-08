export default function crudRepository(model){
    return{
        model:model,
        create: async function(data){
            const newDoc = await model.create(data);
            return newDoc;
        },
        getAll: async function (){
            const response = await model.find();
            return response;
        },
        getById: async function (id){
            const response = await model.findById(id);
            return response;
        },
        update: async function (id,data){
            const response = await model.findByIdAndUpdate(id,data,{new:true, runValidators:true, context:'query'});
            return response;
        },
        delete: async function (id){
            const response = await model.findByIdAndDelete(id);
            return response;
        }
    };
};