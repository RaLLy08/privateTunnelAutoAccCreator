const request = require('request');
require("chromedriver"); 

const swd = require("selenium-webdriver"); 
const browser = new swd.Builder(); 
const tab = browser.forBrowser("chrome").build(); 

const tabToOpen = tab.get('https://portal.privatetunnel.com/signup?logout=1')

createMail = () => new Promise((res, rej) => {
    request('https://www.1secmail.com/api/v1/?action=genRandomMailbox',  (error, response, body) => {
        if (error) rej(error);

        res(JSON.parse(body)[0])
    });
}) 

checkMail = email => new Promise((res, rej) => {
    let emailSep = email.split("@");
    let name = emailSep[0];
    let domain = emailSep[1];

    const autoCheck = () => request(`https://www.1secmail.com/api/v1/?action=getMessages&login=${name}&domain=${domain}`, (error, response, body) => {
        const allMsg = JSON.parse(body);
        const lastMessageId = allMsg[0] && allMsg[allMsg.length - 1].id

        lastMessageId ? 
            res(lastMessageId) : 
            setTimeout(() => autoCheck(), 1000);
    });
    
    autoCheck()
});

readMail = (messageId, email) => new Promise((res, rej) => {
    let emailSep = email.split("@");
    let name = emailSep[0];
    let domain = emailSep[1];

    request(`https://www.1secmail.com/api/v1/?action=readMessage&login=${name}&domain=${domain}&id=${messageId}`, (error, response, body) => {
       res(JSON.parse(body));
    });
})

createMail().then(email => {
    registration(email, 'qwerty123')
})


const registration = (email, password) => {
    tabToOpen.then((res) => {
        const emailBox = tab.findElement(swd.By.name('email'));
        const passwordBox = tab.findElement(swd.By.name('password'));
        const confirmPassBox =  tab.findElement(swd.By.name('confirmPassword'));
    
        const termsAndConditions =  tab.findElement(swd.By.name('termsAndConditions'));
    
        return {
            emailBox,
            passwordBox,
            confirmPassBox,
            termsAndConditions
        };
    }).then(obj => {
        const fillEmail = obj.emailBox.sendKeys(email);
        const fillPass = obj.passwordBox.sendKeys(password);
        const fillConfPass = obj.confirmPassBox.sendKeys(password);
        const clickTerms = obj.termsAndConditions.click();
        
        Promise.all([fillEmail, fillPass, fillConfPass, clickTerms]).then(() => {
            const createAccountClick = tab.findElement(swd.By.id('btn-submit')).click();
            return createAccountClick;
        }).then(() => {
            const waitPageLoad = () => new Promise((res, rej) => {
                const checkInp = setInterval(() => {
                    tab.findElements(swd.By.id("input-email-code")).then(e => {
                        if (e.length !== 0) {
                            clearInterval(checkInp);
                            res();
                        }
                    })
                }, 200)
            })
    
            waitPageLoad().then(() => {
                const promiseInputCode = tab.findElement(swd.By.id('input-email-code'));
            
                return promiseInputCode;
            }).then(inputCode => {
                checkMail(email).then(messageId => {
                    readMail(messageId, email).then(({ textBody }) => {
                        const verifyCode = textBody.replace(/[^\d;]/g, '').substring(0, 6);

                        inputCode.sendKeys(verifyCode);

                        tab.findElement(swd.By.id('btn-confirm-verification-code')).click();
                        consoleText(`email: ${email}, password: ${password}`);

                        return inputCode;
                    })
                })
            })
        })
    })
    
}


const consoleText = (text) => {
    console.log(`\n*-----------------------------------------------------------------*\n ${text}\n*-----------------------------------------------------------------*`);
}
