const cron = require('node-cron');
const axios = require('axios');
const config = require('../config');
const EmailService = require('./emailService');
const to = process.env.SERVICE_EMAIL || 'peiyi.dev@gmail.com';
const moment = require('moment');

// keep track of websites down.
let websitesDown = [];
let emailSent = {}
let downtime = {}

function init() {
    config.monitoredUrls.forEach(url=>{
        emailSent[url] =false;
        downtime[url] = null;
    })

}

function isPassedTimeout(url){
    console.log(downtime)
    if(downtime[url]===null)return true;
    let now = moment();
    let emailBuffer = downtime[url].clone().add(1,'hour');

    if(emailBuffer.isBefore(now))return true;

    return false;

}

async function checkStatus(url){
        try{
            let res = await axios.get(url);
            if(websitesDown.includes(url)){
                if(emailSent[url])emailSent[url] = false;
                websitesDown = websitesDown.filter((link)=>link!==url);
            }
            console.log('websiteUp',websitesDown)
            console.log('websiteUp',emailSent)
            console.log('websiteUp',downtime)
        }catch(error){

            console.log(url,'down');

            if(!websitesDown.includes(url) && !emailSent[url] && isPassedTimeout(url)){

                downtime[url] = moment();
                emailSent[url] = true;
                let subject = `${url} is down`;
                EmailService.sendRawEmail(to,subject);
                websitesDown.push(url);
            }
            console.log('websitesDown',websitesDown)
            console.log('websitesDown',emailSent)
            console.log('websitesDown',downtime)
            
            // throw error;
        }
}

class CronJobs {
    init() {
        init();
        // monitor websites.
        // every 10 mins.
        // 
        cron.schedule('* */10 * * * *',async () => {
            try{
                config.monitoredUrls.forEach(url=>{
                    checkStatus(url);
                })

            }catch(err){
                throw err;
            }
        })
    }

}

module.exports = new CronJobs();