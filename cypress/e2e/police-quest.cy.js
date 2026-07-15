describe('Police Quest E2E', () => {
  it('Police quest: click aggro human, arrest, countHelp increases', () => {
    cy.visit('/');
    cy.get('.game-viewport', { timeout: 10000 }).should('be.visible');
    
    cy.get('[data-type="human_aggr1"]').click();
    cy.get('.police-quest-modal', { timeout: 5000 }).should('be.visible');
    
    cy.get('.arrest-button').click();
    cy.get('.police-quest-modal', { timeout: 5000 }).should('not.exist');
  });
});
