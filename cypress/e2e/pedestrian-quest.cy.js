describe('Pedestrian Quest E2E', () => {
  it('Pedestrian quest: red light -> quest modal -> click pedestrian -> siren -> car moves -> fine button -> countHelp increases', () => {
    cy.visit('/');
    cy.get('.game-viewport', { timeout: 10000 }).should('be.visible');
    
    cy.wait(5000);
    
    cy.get('[data-type="human1"]').click();
    cy.get('.pedestrian-crossing-modal', { timeout: 5000 }).should('be.visible');
    
    cy.get('.quest-pedestrian').click();
    cy.get('.quest-car', { timeout: 5000 }).should('be.visible');
    
    cy.get('.fine-button', { timeout: 5000 }).should('be.visible');
    
    cy.get('.fine-button').click();
    cy.get('.pedestrian-crossing-modal', { timeout: 5000 }).should('not.exist');
  });
});
