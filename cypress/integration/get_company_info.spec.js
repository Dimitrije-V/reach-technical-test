const siteUrl = 'https://www.medicines.org.uk'
let sectionData = {}
let companyList = {}

describe("Write all specified company info to JSON file, and download company logo images", () => {
    
    /**
     * Initially, navigate to the company browser, and save the name and URL of each section to a JSON object,
     * then navigate to each section and save the name and URL of the first, third, and last company on the page to the 
     * above JSON. Finally, write the JSON object to a file, so that whoever reviews this can see the data structure from
     * which we get company names and URLs in the next part of this test.
     */
    it('Get sections and company URLs', () => {
        cy.visit(`${siteUrl}/emc/browse-companies`);
        cy.acceptCookies()
        cy.getSectionData(sectionData, siteUrl).then(() => {
            for (let section in sectionData) {
                cy.getFirstThirdAndLastCompanyData(sectionData, section, siteUrl)
            }
        })
            .then(() => {
                cy.writeFile('cypress/fixtures/sectionData.json', sectionData)
            })
    })

    /**
     * Given a JSON object containing the name and URL of some companies, navigate to each company, and add their names,
     * contact information, and the URL of their logo to a new JSON object. Then write that JSON object to a file under the
     * fixtures folder.
     */
    it("Get company data and write to JSON file", () => {
        let companyData = {}
        cy.visit(siteUrl)
        cy.acceptCookies()
            .then(() => {
                for (let section in sectionData) {
                    for (let siteName in sectionData[section].contents) {
                        let companyUrl = `${sectionData[section].contents[siteName].url}`
                        cy.getSiteData(companyUrl, companyData, siteUrl, siteName)
                    }
                }
            })
            .then(() => {
                companyList = companyData
                cy.writeFile('cypress/fixtures/companyData.json', companyData)
            })
    })
    
    /** 
     * Given a JSON object containing some companies and the URLs of their logos, download all logos to the folder 
     * cypress/Downloads.
     * We remove "/" symbols in company names, as a company called "A / B" would otherwise produce a file B.jpg in a folder
     * called A, instead of a file A/B.jpg
    */
    it("Get company logo images and save to /cypress/Downloads folder", () => {
        for (let company in companyList) {
            let logoUrl = companyList[company].Logo
            let fileName = `${company}.jpg`.replace('/', '')
            cy.downloadFile(logoUrl, 'Downloads', fileName)
        }
    })
})




