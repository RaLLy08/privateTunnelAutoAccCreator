require("chromedriver"); 

const swd = require("selenium-webdriver"); 
const browser = new swd.Builder(); 

const vpnTab = browser.forBrowser("chrome").build(); 
const mailTab = browser.forBrowser("chrome").build(); 

const vpnTabToOpen = vpnTab.get('https://portal.privatetunnel.com/signup?logout=1')


const getMail = async () => {
    await mailTab.get('https://10minutemail.com/');

    const waitMail = async () =>  {
        const checkMail = async () => {
            const checkMail = await mailTab.findElement(swd.By.id('mail_address')).getAttribute("value");
 
            return checkMail;
        };
        const mail = await checkMail();
        
        if (mail) return mail
        else return waitMail();
    }

    const mail = await waitMail();

    return mail
}

const getMessageCode = async () => {
    const waitMessage = async () => {
        const checkMessage = await mailTab.findElements(swd.By.xpath('//*[@id="mail_messages_content"]/div/div[2]/table/tbody/tr[2]/td/div/div[2]'));

        if (checkMessage[0]) return checkMessage[0];
        else return waitMessage();
    }

    const message = await waitMessage();

    const parseMessage = await message.getAttribute("innerText");

    return parseMessage.replace(/[^\d;]/g, '').substring(0, 6);
}

getMail().then(mail => {
    registration(mail, 'qwerty123');
})


const registration = (email, password) => {
    vpnTabToOpen.then((res) => {
        const emailBox = vpnTab.findElement(swd.By.name('email'));
        const passwordBox = vpnTab.findElement(swd.By.name('password'));
        const confirmPassBox =  vpnTab.findElement(swd.By.name('confirmPassword'));
    
        const termsAndConditions =  vpnTab.findElement(swd.By.name('termsAndConditions'));
    
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
            const createAccountClick = vpnTab.findElement(swd.By.id('btn-submit')).click();
            return createAccountClick;
        }).then(() => {
            const waitPageLoad = () => new Promise((res, rej) => {
                const checkInp = setInterval(() => {
                    vpnTab.findElements(swd.By.id("input-email-code")).then(e => {
                        if (e.length !== 0) {
                            clearInterval(checkInp);
                            res();
                        }
                    })
                }, 200)
            })
    
            waitPageLoad().then(() => {
                const promiseInputCode = vpnTab.findElement(swd.By.id('input-email-code'));
            
                return promiseInputCode;
            }).then(inputCode => {
                getMessageCode().then(verifyCode => {
                    console.log(verifyCode);
                    inputCode.sendKeys(verifyCode);

                    vpnTab.findElement(swd.By.id('btn-confirm-verification-code')).click();
                    consoleText(`email: ${email}, password: ${password}`);

                    return inputCode;
                })
                
            })
        })
    })
    
}


const consoleText = (text) => {
    console.log(`\n*-----------------------------------------------------------------*\n ${text}\n*-----------------------------------------------------------------*`);
}


// element(by.id("id"));
// element(by.css("#id"));
// element(by.xpath("//*[@id='id']"));
// browser.executeScript("return document.querySelector('#id');");
// browser.executeScript("return document.getElementById('id');");