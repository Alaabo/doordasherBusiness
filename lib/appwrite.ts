import {Account, AppwriteException, Avatars, Client, Databases, ID, OAuthProvider, Query , Storage } from "react-native-appwrite"
import { openAuthSessionAsync } from "expo-web-browser";
import {Businesses, DBUser, ProductType, RequestType, Transaction} from "@/types/globals";
import { makeRedirectUri } from 'expo-auth-session'



interface UploadImageProps {
  uri: string;
  name: string;
  type: string;
  size: number;
}





export const config = {
    Platform : 'com.alaabo.doordasher',
    Platform2 : "doordasherWeb",
    endpoint : process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectd : process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ,
    databseId : process.env.EXPO_PUBLIC_APPWRITE_DATABASEID
}


export const client = new Client()

client
        .setEndpoint(config.endpoint!)
        .setProject(config.projectd!)
        .setPlatform(config.Platform)
        

        



export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client)


//Auth logic
export async function login() {
  try {
    let redirectScheme = makeRedirectUri();

    // HACK: localhost is a hack to get the redirection possible
    if (!redirectScheme.includes('localhost')) {
      redirectScheme = `${redirectScheme}localhost`;
    }
    console.log(redirectScheme)
   

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectScheme
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.href,
      redirectScheme
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    await account.createSession(userId, secret);
    const userDB = await readUser(userId)
    if(!userDB){
      const user = await account.get();
            const userNew = {
                $id: user.$id,
                name: user.name,
                email: user.email,
                avatar: "https://images.unsplash.com/photo-1691335053879-02096d6ee2ca?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                role: "client",
                
            };

          await createUser(userNew as DBUser);
    }
    
    return {succes : true}
    
  } catch (error) {
    console.log(error)
    return {succes : false};
  }
}


export async function logoutCurrentUser() {
    try {
      const result = await account.deleteSession("current");
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  
export async function ChekAuthState() {
    try {
      const currentAccount = await account.get();
      if( currentAccount){
        const userInfo = await readUser(currentAccount.$id)
        const userDetails = await readBusiness(currentAccount.$id);
        if(!userDetails){
          return {
                    $id : currentAccount.$id ,
                    name : currentAccount.name ,
                    email : currentAccount.email ,
                    avatar : userInfo.avatar? userInfo.avatar: "https://images.unsplash.com/photo-1691335053879-02096d6ee2ca?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

                    new : true
                   }
        }else{
          return { ...userDetails , new : false , avatar : userInfo.avatar}
        }
      }
      return null
  } catch (error) {

      if (error instanceof AppwriteException && error.code === 401) {
        console.log("no logged user")
        return null
      }else {

        console.error('Auth check failed:', error);
      }
     
    } 
  }

//Business Logic
export const uploadImage = async (imageData: UploadImageProps
) =>{
  try{
    const file = {
      name: imageData.name,
      type: imageData.type,
      size: imageData.size,
      uri: imageData.uri
    };

    const response = await storage.createFile("pictures" ,  ID.unique() , file)
    return  response
  }catch(error){
    return error as Error
  }
}

export const createBusiness = async (business : Businesses) =>{
  try {
    const businessDB = await databases.createDocument(config.databseId! , "businesses" ,business.$id ,{
      
      name : business.name ,
      lat : business.lat ,
      lon : business.lon ,
      products : business.products ,
      email : business.email ,
      phoneNumber : business.phoneNumber
    })

    return businessDB
  } catch (
    error
  ) {
    console.log(error)
    return error as Error
  }
}

export const readBusiness = async (id : string ) =>{
  try {
    const user = await databases.getDocument(config.databseId! , "businesses" , id)
    
    if(!user) return null

    return user
  } catch (error : any) {
    console.log(error)
    if (error.code === 404 ) return null
    return error
  }
}


//Products Logic
export const fetchProductsById = async (id : string) : Promise<ProductType[] | null | Error> =>{
  try {
    const request = await databases.getDocument(config.databseId! , "products" , id , [
        Query.equal('storeID', id )
    ])

    if(!request) return null
    
    return request as unknown as ProductType[]
  } catch (error : any) {
    console.log(error)
    if (error.message === "Document with the requested ID could not be found" ) return null
    return error
  }
  
}

export const fetchProducts= async (id : string) : Promise<ProductType[] | null | Error> =>{
  try {
    const request = await databases.listDocuments(config.databseId! , "products" , [Query.equal("storeID" , id)])

    if(!request) return null
    
    return request.documents as unknown as ProductType[]
  } catch (error : any) {
    console.log(error)
    if (error.message === "Document with the requested ID could not be found" ) return null
    return error
  }
  
}

export const fetchProductDetails = async (id: string): Promise<ProductType | null> => {
  try {
    const request = await databases.getDocument(config.databseId!, "products", id);
    if (!request) return null;
    //@ts-ignore
    return request;
  } catch (error: any) {
    console.log(error);
    if (error.message?.includes("could not be found")) return null;
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await databases.deleteDocument(config.databseId! , "products" ,id)
  } catch (error) {
    console.log(error)
 }
};


export const createProduct = async (product : Omit<ProductType, '$id'>) =>{
  try {
    const response = await databases.createDocument(config.databseId! , "products" , ID.unique() ,product)
    
    return response
  } catch (
    error
  ) {
    console.log(error)
    return error as Error
  }
}



//Users Section

export const createUser = async (user : DBUser) =>{
  try {
      await databases.createDocument(config.databseId! , "users" , user.$id ,{
        name : user.name ,
        email : user.email ,
        avatar : user.avatar ?? '',
        role : 'client' ,
        phone : user.phone
      })
      
      return user
    } catch (
      error
    ) {
      console.log(error)
      return error as Error
    }
  }
  

  
export const readUser = async (id : string ) =>{
  try {
    const user = await databases.getDocument(config.databseId! , "users" , id)
    
    if(!user) return null
    
    return user
  } catch (error : any) {
    console.log(error)
    if (error.code === 404 ) return null
    return error
  }
}



//Requests Logic
export const getRequestByBusin = async (id : string)=>{
  try {
    
    
    
    
    const requests = await databases.listDocuments(config.databseId! , "requests" , [
      Query.equal('driverId' , id)
    ])
    
    return requests as unknown as RequestType[]
    
  } catch (error) {
    console.log(error)
    return error as Error
  }
}



export const getReq = async (id : string) => {
  try {
    const requests  = await databases.listDocuments(config.databseId! ,"requests" , [
        Query.equal("user" , id) 
      ])
      if(requests.total == 0) return null
      
      return requests.documents
    } catch (error) {
      console.log(error)
    }
  }
  export const getReqComplete = async (id : string) => {
    try {
      const requests  = await databases.listDocuments(config.databseId! ,"requests" , [
        Query.equal("user" , id) ,
        Query.equal('status' , ['pending' , 'onRoad' , 'accepted']), 
        Query.limit(10)
      ])
      if(requests.total == 0) return null
      
      return requests.documents
    } catch (error) {
      console.log(error)
    }
  }
  export const getReqById = async (id : string) =>{
    try {
    const request = await databases.getDocument(config.databseId! , "requests" , id)
    
    if(!request) return null
    
    return request
  } catch (error : any) {
    console.log(error)
    if (error.message === "Document with the requested ID could not be found" ) return null
    return error
  }
}



    export const fetchOrdersByStoreId = async (id : string) : Promise<RequestType[] | null> =>{
      try {
        const request = await databases.listDocuments(config.databseId! , "requests" , [Query.equal("storeID" , id)])
    
        if(!request) return null
        //@ts-ignore
        return request
      } catch (error : any) {
        console.log(error)
        if (error.message === "Document with the requested ID could not be found" ) return null
        return error
      }
    
    }

    export const deleteReq = async (id : string)=>{
      try {
         await databases.deleteDocument(config.databseId! , "requests" ,id)
      } catch (error) {
         console.log(error)
      }
 
 }
