rsync -rlvz \
  --omit-dir-times \
  --exclude='.next' \
  --exclude='node_modules' \
  /home/duriaux/Dev/perso/spotosh \
  spotish@128.178.116.76:/srv/spotosh
