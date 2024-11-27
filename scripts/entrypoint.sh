#! /bin/sh
export DISPLAY=${DISPLAY:-:0} # Select screen 0 by default.
export XVFB_SCREEN_SIZE=${XVFB_SCREEN_SIZE:-1024x768x24}
export X11VNC_PASSWORD=${X11VNC_PASSWORD:-password}
xdpyinfo
rm -rf /tmp/.X99-lock
rm -rf .X11-unix
sleep 1
! pgrep -a Xvfb && Xvfb $DISPLAY -screen 0 ${XVFB_SCREEN_SIZE} -ac &
sleep 1
if which x11vnc &>/dev/null; then
  # ! pgrep -a x11vnc && x11vnc -bg -forever -passwd ${X11VNC_PASSWORD} -ncache 10 -ncache_cr -quiet -display WAIT$DISPLAY &
  ! pgrep -a x11vnc && x11vnc -bg --shared -forever -passwd ${X11VNC_PASSWORD} -quiet -display WAIT$DISPLAY &
fi
if which fluxbox &>/dev/null; then
  ! pgrep -a fluxbox && fluxbox 2>/dev/null &
fi
echo "IP: $(hostname -I) ($(hostname))"

exec "$@"