TECH_SPEC.md: Police Pedestrian Crossing Quest

== NEW FILES ==

1. src/components/game/PedestrianCrossingModal.jsx
   Modal with background, CarModel, pedestrian human, fine button.
   States: waiting, walking, stopped.
   Animation via requestAnimationFrame + deltaTime.
   Click handler: toggleSirena (ВКЛЮЧАЕТ сирену), car moves to center, button appears.

2. src/style/pedestrian_crossing.css
   .pedestrian-crossing-modal - fixed, full screen, z-index 1000
   .modal-background - police_pedestrian_crossing.png cover
   .quest-car - absolute, bottom 40%, width 120px
   .quest-pedestrian - absolute, center X, above center Y, cursor pointer
   .fine-button - same style as .arrest-button, text Write Fine

== CHANGES ==

3. src/state/mapStore.jsx
   Fields: isPedestrianCrossingQuestActive=false, pedestrianCrossingTargetObject=null, pedestrianCarPosition=-150, pedestrianState=waiting
   Methods: startPedestrianCrossingQuest(targetObj), finishPedestrianCrossingQuest()

4. src/state/carStore.jsx
   Field: pedestrianQuestTriggered=false
   checkTrafficLight: add 50% chance logic to startPedestrianCrossingQuest
   Reset flag when traffic light leaves screen

5. src/components/game/Game.jsx
   Import PedestrianCrossingModal
   Render after PoliceQuestModal

== DEPENDENCIES ==
#1 no deps -> #3 depends on #1 -> #4 depends on #3 -> #5 depends on #3,#4
#6 depends on #3 -> #7 depends on #1,#2 -> #8 depends on #3,#6,#7 -> #9 all

== NO NEW NPM PACKAGES ==