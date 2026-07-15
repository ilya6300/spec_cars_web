describe('Game Controls E2E', () => {
  it('Gear box: shift gears N, 1, 2, 3, 4', () => {
    cy.visit('/');
    cy.get('.game-viewport', { timeout: 10000 }).should('be.visible');
    
    cy.get('.gearbox').within(() => {
      cy.get('.gear-n').click();
      cy.get('.gear-1').click();
      cy.get('.gear-2').click();
      cy.get('.gear-3').click();
      cy.get('.gear-4').click();
    });
  });
  
  it('Siren toggle: click siren button, sirena class appears', () => {
    cy.visit('/');
    cy.get('.game-viewport', { timeout: 10000 }).should('be.visible');
    
    cy.get('.siren-btn').click();
    cy.get('.sirena-car-on').should('be.visible');
  });
});
