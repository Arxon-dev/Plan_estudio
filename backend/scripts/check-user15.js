const axios = require('axios');

async function run(){
  const API='http://localhost:3000/api';
  const TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzNDc1Mjg4LCJleHAiOjE3NjM1NjE2ODh9.AzMI3lfXUpxeiH6EdV2uLFZb9GLxBdeTF7K3R52fgak';
  try{
    const health=await axios.get(`${API}/health`);
    console.log('health:',health.data);
    const profile=await axios.get(`${API}/auth/profile`,{headers:{Authorization:`Bearer ${TOKEN}`}});
    console.log('profile:',profile.data);
    const themes=await axios.get(`${API}/themes`,{headers:{Authorization:`Bearer ${TOKEN}`}});
    console.log('themes count:',themes.data.themes?.length);
  }catch(e){
    console.log('error:',e.response?.status||'',e.response?.data||e.message);
  }
}

run();