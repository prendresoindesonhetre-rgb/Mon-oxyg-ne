package fr.prendresoindesonhetre.petanque;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        setContentView(new PetanqueView(this));
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    static class PetanqueView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Random random = new Random();
        private final List<Ball> balls = new ArrayList<>();
        private final int[] score = new int[]{0, 0};
        private final int[] used = new int[]{0, 0};

        private final float density;
        private int width;
        private int height;
        private float headerH;
        private float ballR;
        private float jackR;
        private float launchX;
        private float launchY;
        private Jack jack;

        private int currentPlayer = 0;
        private boolean aiming = false;
        private float aimX;
        private float aimY;
        private boolean throwInProgress = false;
        private boolean endResolved = false;
        private boolean gameOver = false;
        private int lastEndPoints = 0;
        private int lastEndWinner = -1;
        private long lastFrameNs = 0L;

        private final RectF actionButton = new RectF();

        PetanqueView(Context context) {
            super(context);
            density = getResources().getDisplayMetrics().density;
            setFocusable(true);
            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeCap(Paint.Cap.ROUND);
        }

        private float dp(float value) {
            return value * density;
        }

        @Override
        protected void onSizeChanged(int w, int h, int oldw, int oldh) {
            width = w;
            height = h;
            headerH = Math.max(dp(68), h * 0.13f);
            ballR = Math.max(dp(15), Math.min(w, h) * 0.025f);
            jackR = ballR * 0.43f;
            launchX = w * 0.50f;
            launchY = h - Math.max(dp(58), ballR * 2.5f);
            startNewGame();
        }

        private void startNewGame() {
            score[0] = 0;
            score[1] = 0;
            gameOver = false;
            currentPlayer = 0;
            startNewEnd();
        }

        private void startNewEnd() {
            balls.clear();
            used[0] = 0;
            used[1] = 0;
            currentPlayer = 0;
            aiming = false;
            throwInProgress = false;
            endResolved = false;
            lastEndPoints = 0;
            lastEndWinner = -1;
            lastFrameNs = 0L;

            float terrainTop = headerH + dp(18);
            float terrainBottom = launchY - dp(100);
            float usable = Math.max(dp(180), terrainBottom - terrainTop);
            float xSpread = Math.min(width * 0.22f, dp(240));
            float jx = width * 0.50f + (random.nextFloat() * 2f - 1f) * xSpread;
            float jy = terrainTop + usable * (0.30f + random.nextFloat() * 0.16f);
            jack = new Jack(jx, jy, jackR);
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            if (width <= 0 || height <= 0) return;

            if (throwInProgress) {
                updatePhysics();
            }

            drawTerrain(canvas);
            drawHeader(canvas);
            drawLaunchArea(canvas);
            drawJack(canvas);
            for (Ball b : balls) drawBall(canvas, b.x, b.y, b.team, false);

            if (!throwInProgress && !endResolved && used[0] + used[1] < 6) {
                drawBall(canvas, launchX, launchY, currentPlayer, true);
            }

            if (aiming) drawAim(canvas);
            if (endResolved) drawEndOverlay(canvas);

            if (throwInProgress) postInvalidateOnAnimation();
        }

        private void drawTerrain(Canvas canvas) {
            canvas.drawColor(Color.rgb(203, 178, 126));

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(214, 190, 141));
            canvas.drawRect(0, headerH, width, height, paint);

            // Petits graviers fixes pour donner un aspect terrain sans image externe.
            for (int i = 0; i < 145; i++) {
                long s = (long) i * 1103515245L + 12345L;
                float px = ((s & 0x7fffffffL) % 1000L) / 1000f * width;
                long s2 = s * 1664525L + 1013904223L;
                float py = headerH + (((s2 & 0x7fffffffL) % 1000L) / 1000f) * (height - headerH);
                float r = dp(0.7f + (i % 4) * 0.35f);
                int shade = 152 + (i % 5) * 9;
                paint.setColor(Color.rgb(shade + 22, shade + 10, Math.max(90, shade - 18)));
                canvas.drawOval(px - r * 1.7f, py - r, px + r * 1.7f, py + r, paint);
            }

            paint.setColor(Color.argb(55, 95, 71, 38));
            canvas.drawRect(0, headerH, width, headerH + dp(3), paint);
        }

        private void drawHeader(Canvas canvas) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(34, 62, 52));
            canvas.drawRect(0, 0, width, headerH, paint);

            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextAlign(Paint.Align.LEFT);
            paint.setTextSize(Math.min(dp(24), headerH * 0.34f));
            paint.setColor(Color.WHITE);
            canvas.drawText("MA PÉTANQUE", dp(18), headerH * 0.43f, paint);

            paint.setTypeface(Typeface.DEFAULT);
            paint.setTextSize(Math.min(dp(13), headerH * 0.20f));
            paint.setColor(Color.rgb(217, 231, 225));
            canvas.drawText("Partie en 13 points", dp(18), headerH * 0.73f, paint);

            float centerX = width * 0.50f;
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(Math.min(dp(22), headerH * 0.31f));
            paint.setColor(Color.rgb(102, 187, 255));
            canvas.drawText("BLEU  " + score[0], centerX - dp(72), headerH * 0.48f, paint);
            paint.setColor(Color.WHITE);
            canvas.drawText("—", centerX, headerH * 0.48f, paint);
            paint.setColor(Color.rgb(255, 127, 99));
            canvas.drawText(score[1] + "  ROUGE", centerX + dp(79), headerH * 0.48f, paint);

            paint.setTypeface(Typeface.DEFAULT);
            paint.setTextSize(Math.min(dp(13), headerH * 0.19f));
            paint.setColor(Color.rgb(231, 239, 235));
            String info;
            if (endResolved) {
                info = gameOver ? "Partie terminée" : "Mène terminée";
            } else if (throwInProgress) {
                info = "La boule roule…";
            } else {
                info = (currentPlayer == 0 ? "Au bleu" : "Au rouge")
                        + "  •  boules restantes : " + (3 - used[currentPlayer]);
            }
            canvas.drawText(info, centerX, headerH * 0.78f, paint);
        }

        private void drawLaunchArea(Canvas canvas) {
            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeWidth(dp(2.5f));
            stroke.setColor(Color.argb(180, 79, 67, 43));
            canvas.drawCircle(launchX, launchY, ballR * 2.15f, stroke);

            paint.setStyle(Paint.Style.FILL);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(dp(12));
            paint.setColor(Color.argb(190, 71, 58, 37));
            if (!throwInProgress && !endResolved) {
                canvas.drawText("TOUCHE LA BOULE • GLISSE • RELÂCHE", launchX,
                        launchY + ballR * 3.15f, paint);
            }
        }

        private void drawJack(Canvas canvas) {
            if (jack == null) return;
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(55, 0, 0, 0));
            canvas.drawCircle(jack.x + dp(2), jack.y + dp(3), jack.r * 1.08f, paint);
            paint.setColor(Color.rgb(238, 183, 52));
            canvas.drawCircle(jack.x, jack.y, jack.r, paint);
            paint.setColor(Color.rgb(255, 221, 105));
            canvas.drawCircle(jack.x - jack.r * 0.30f, jack.y - jack.r * 0.32f, jack.r * 0.28f, paint);
        }

        private void drawBall(Canvas canvas, float x, float y, int team, boolean active) {
            float r = ballR;
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(active ? 70 : 48, 0, 0, 0));
            canvas.drawCircle(x + dp(2.5f), y + dp(3.5f), r * 1.04f, paint);

            paint.setColor(active ? Color.rgb(205, 214, 216) : Color.rgb(177, 187, 190));
            canvas.drawCircle(x, y, r, paint);
            paint.setColor(Color.rgb(231, 237, 238));
            canvas.drawCircle(x - r * 0.28f, y - r * 0.32f, r * 0.36f, paint);

            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeWidth(Math.max(dp(2), r * 0.13f));
            stroke.setStrokeCap(Paint.Cap.ROUND);
            stroke.setColor(team == 0 ? Color.rgb(36, 132, 220) : Color.rgb(220, 73, 57));
            canvas.save();
            canvas.clipCircle(x, y, r * 0.94f);
            if (team == 0) {
                canvas.drawLine(x - r * 0.75f, y + r * 0.25f, x + r * 0.75f, y - r * 0.25f, stroke);
                canvas.drawLine(x - r * 0.75f, y + r * 0.52f, x + r * 0.75f, y + r * 0.02f, stroke);
            } else {
                canvas.drawLine(x - r * 0.72f, y - r * 0.38f, x + r * 0.72f, y + r * 0.38f, stroke);
                canvas.drawLine(x - r * 0.72f, y - r * 0.08f, x + r * 0.72f, y + r * 0.68f, stroke);
            }
            canvas.restore();

            stroke.setStrokeWidth(dp(1.2f));
            stroke.setColor(Color.argb(130, 66, 76, 79));
            canvas.drawCircle(x, y, r, stroke);
        }

        private void drawAim(Canvas canvas) {
            float dx = aimX - launchX;
            float dy = aimY - launchY;
            float dist = (float) Math.sqrt(dx * dx + dy * dy);
            float maxDrag = Math.min(width, height) * 0.42f;
            if (dist > maxDrag && dist > 0) {
                float scale = maxDrag / dist;
                dx *= scale;
                dy *= scale;
                dist = maxDrag;
            }

            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeWidth(dp(4));
            stroke.setColor(currentPlayer == 0 ? Color.rgb(36, 132, 220) : Color.rgb(220, 73, 57));
            canvas.drawLine(launchX, launchY, launchX + dx, launchY + dy, stroke);

            if (dist > dp(8)) {
                float ux = dx / dist;
                float uy = dy / dist;
                float tipX = launchX + dx;
                float tipY = launchY + dy;
                float side = dp(10);
                float back = dp(18);
                Path arrow = new Path();
                arrow.moveTo(tipX, tipY);
                arrow.lineTo(tipX - ux * back - uy * side, tipY - uy * back + ux * side);
                arrow.lineTo(tipX - ux * back + uy * side, tipY - uy * back - ux * side);
                arrow.close();
                paint.setStyle(Paint.Style.FILL);
                paint.setColor(currentPlayer == 0 ? Color.rgb(36, 132, 220) : Color.rgb(220, 73, 57));
                canvas.drawPath(arrow, paint);
            }

            float pct = Math.min(1f, dist / maxDrag);
            float barW = Math.min(dp(220), width * 0.22f);
            float barH = dp(11);
            float left = width - barW - dp(24);
            float top = headerH + dp(18);
            paint.setColor(Color.argb(95, 30, 30, 30));
            canvas.drawRoundRect(left, top, left + barW, top + barH, barH / 2, barH / 2, paint);
            paint.setColor(pct < 0.68f ? Color.rgb(63, 154, 94) : Color.rgb(218, 137, 49));
            canvas.drawRoundRect(left, top, left + barW * pct, top + barH, barH / 2, barH / 2, paint);

            paint.setTextAlign(Paint.Align.RIGHT);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(dp(11));
            paint.setColor(Color.rgb(72, 59, 40));
            canvas.drawText("PUISSANCE " + Math.round(pct * 100) + "%", left + barW, top + dp(27), paint);
        }

        private void drawEndOverlay(Canvas canvas) {
            float boxW = Math.min(width * 0.58f, dp(520));
            float boxH = Math.min(height * 0.46f, dp(270));
            float left = (width - boxW) / 2f;
            float top = headerH + (height - headerH - boxH) / 2f;
            float right = left + boxW;
            float bottom = top + boxH;

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(220, 27, 41, 36));
            canvas.drawRoundRect(left, top, right, bottom, dp(18), dp(18), paint);

            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(Math.min(dp(30), boxH * 0.18f));
            paint.setColor(Color.WHITE);
            String title;
            if (gameOver) {
                title = (lastEndWinner == 0 ? "BLEU" : "ROUGE") + " GAGNE !";
            } else {
                title = "MÈNE TERMINÉE";
            }
            canvas.drawText(title, width / 2f, top + boxH * 0.25f, paint);

            paint.setTypeface(Typeface.DEFAULT);
            paint.setTextSize(Math.min(dp(18), boxH * 0.12f));
            paint.setColor(Color.rgb(231, 239, 235));
            String detail;
            if (gameOver) {
                detail = String.format(Locale.FRANCE, "Score final : %d — %d", score[0], score[1]);
            } else {
                detail = (lastEndWinner == 0 ? "Bleu" : "Rouge") + " marque "
                        + lastEndPoints + (lastEndPoints > 1 ? " points" : " point")
                        + "  •  " + score[0] + " — " + score[1];
            }
            canvas.drawText(detail, width / 2f, top + boxH * 0.45f, paint);

            float btnW = Math.min(boxW * 0.62f, dp(280));
            float btnH = Math.min(dp(56), boxH * 0.23f);
            float btnLeft = width / 2f - btnW / 2f;
            float btnTop = bottom - btnH - boxH * 0.12f;
            actionButton.set(btnLeft, btnTop, btnLeft + btnW, btnTop + btnH);
            paint.setColor(Color.rgb(237, 182, 73));
            canvas.drawRoundRect(actionButton, btnH / 2, btnH / 2, paint);

            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(Math.min(dp(16), btnH * 0.36f));
            paint.setColor(Color.rgb(38, 48, 42));
            canvas.drawText(gameOver ? "NOUVELLE PARTIE" : "MÈNE SUIVANTE",
                    width / 2f, btnTop + btnH * 0.64f, paint);
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            float x = event.getX();
            float y = event.getY();

            if (event.getAction() == MotionEvent.ACTION_DOWN) {
                if (endResolved && actionButton.contains(x, y)) {
                    if (gameOver) startNewGame(); else startNewEnd();
                    return true;
                }
                if (throwInProgress || endResolved || used[0] + used[1] >= 6) return true;
                float dx = x - launchX;
                float dy = y - launchY;
                if (dx * dx + dy * dy <= ballR * ballR * 7.5f) {
                    aiming = true;
                    aimX = x;
                    aimY = y;
                    invalidate();
                }
                return true;
            }

            if (event.getAction() == MotionEvent.ACTION_MOVE && aiming) {
                aimX = x;
                aimY = y;
                invalidate();
                return true;
            }

            if ((event.getAction() == MotionEvent.ACTION_UP || event.getAction() == MotionEvent.ACTION_CANCEL) && aiming) {
                aiming = false;
                if (event.getAction() == MotionEvent.ACTION_CANCEL) {
                    invalidate();
                    return true;
                }

                float dx = x - launchX;
                float dy = y - launchY;
                float dist = (float) Math.sqrt(dx * dx + dy * dy);
                float maxDrag = Math.min(width, height) * 0.42f;
                if (dist < dp(18)) {
                    invalidate();
                    return true;
                }
                if (dist > maxDrag) {
                    float scale = maxDrag / dist;
                    dx *= scale;
                    dy *= scale;
                    dist = maxDrag;
                }

                float power = 4.8f;
                float vx = dx * power;
                float vy = dy * power;
                Ball ball = new Ball(launchX, launchY, ballR, currentPlayer, vx, vy);
                balls.add(ball);
                used[currentPlayer]++;
                throwInProgress = true;
                lastFrameNs = System.nanoTime();
                postInvalidateOnAnimation();
                return true;
            }

            return true;
        }

        private void updatePhysics() {
            long now = System.nanoTime();
            if (lastFrameNs == 0L) {
                lastFrameNs = now;
                return;
            }
            float dt = (now - lastFrameNs) / 1_000_000_000f;
            lastFrameNs = now;
            dt = Math.max(0.004f, Math.min(0.032f, dt));

            int subSteps = 2;
            float step = dt / subSteps;
            for (int s = 0; s < subSteps; s++) {
                for (Ball b : balls) integrateBall(b, step);
                integrateJack(step);

                for (int i = 0; i < balls.size(); i++) {
                    for (int j = i + 1; j < balls.size(); j++) {
                        collideBalls(balls.get(i), balls.get(j));
                    }
                    collideBallJack(balls.get(i));
                }
            }

            boolean moving = false;
            for (Ball b : balls) {
                if (b.vx != 0f || b.vy != 0f) {
                    moving = true;
                    break;
                }
            }
            if (!moving && jack != null && (jack.vx != 0f || jack.vy != 0f)) moving = true;

            if (!moving) finishThrow();
        }

        private void integrateBall(Ball b, float dt) {
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            float friction = (float) Math.pow(0.975, dt * 60f);
            b.vx *= friction;
            b.vy *= friction;
            if (speed2(b.vx, b.vy) < 22f * 22f) {
                b.vx = 0f;
                b.vy = 0f;
            }
            keepInBounds(b);
        }

        private void integrateJack(float dt) {
            if (jack == null) return;
            jack.x += jack.vx * dt;
            jack.y += jack.vy * dt;
            float friction = (float) Math.pow(0.965, dt * 60f);
            jack.vx *= friction;
            jack.vy *= friction;
            if (speed2(jack.vx, jack.vy) < 14f * 14f) {
                jack.vx = 0f;
                jack.vy = 0f;
            }
            keepJackInBounds();
        }

        private void keepInBounds(Ball b) {
            float left = b.r + dp(8);
            float right = width - b.r - dp(8);
            float top = headerH + b.r + dp(8);
            float bottom = height - b.r - dp(8);
            if (b.x < left) {
                b.x = left;
                b.vx = Math.abs(b.vx) * 0.48f;
            } else if (b.x > right) {
                b.x = right;
                b.vx = -Math.abs(b.vx) * 0.48f;
            }
            if (b.y < top) {
                b.y = top;
                b.vy = Math.abs(b.vy) * 0.48f;
            } else if (b.y > bottom) {
                b.y = bottom;
                b.vy = -Math.abs(b.vy) * 0.48f;
            }
        }

        private void keepJackInBounds() {
            float left = jack.r + dp(8);
            float right = width - jack.r - dp(8);
            float top = headerH + jack.r + dp(8);
            float bottom = height - jack.r - dp(8);
            if (jack.x < left) {
                jack.x = left;
                jack.vx = Math.abs(jack.vx) * 0.42f;
            } else if (jack.x > right) {
                jack.x = right;
                jack.vx = -Math.abs(jack.vx) * 0.42f;
            }
            if (jack.y < top) {
                jack.y = top;
                jack.vy = Math.abs(jack.vy) * 0.42f;
            } else if (jack.y > bottom) {
                jack.y = bottom;
                jack.vy = -Math.abs(jack.vy) * 0.42f;
            }
        }

        private void collideBalls(Ball a, Ball b) {
            float dx = b.x - a.x;
            float dy = b.y - a.y;
            float minDist = a.r + b.r;
            float d2 = dx * dx + dy * dy;
            if (d2 <= 0.0001f || d2 >= minDist * minDist) return;

            float d = (float) Math.sqrt(d2);
            float nx = dx / d;
            float ny = dy / d;
            float overlap = minDist - d;
            a.x -= nx * overlap * 0.5f;
            a.y -= ny * overlap * 0.5f;
            b.x += nx * overlap * 0.5f;
            b.y += ny * overlap * 0.5f;

            float rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rel > 0f) return;
            float restitution = 0.72f;
            float impulse = -(1f + restitution) * rel / 2f;
            float ix = impulse * nx;
            float iy = impulse * ny;
            a.vx -= ix;
            a.vy -= iy;
            b.vx += ix;
            b.vy += iy;
        }

        private void collideBallJack(Ball b) {
            if (jack == null) return;
            float dx = jack.x - b.x;
            float dy = jack.y - b.y;
            float minDist = b.r + jack.r;
            float d2 = dx * dx + dy * dy;
            if (d2 <= 0.0001f || d2 >= minDist * minDist) return;

            float d = (float) Math.sqrt(d2);
            float nx = dx / d;
            float ny = dy / d;
            float overlap = minDist - d;
            b.x -= nx * overlap * 0.28f;
            b.y -= ny * overlap * 0.28f;
            jack.x += nx * overlap * 0.72f;
            jack.y += ny * overlap * 0.72f;

            float rel = (jack.vx - b.vx) * nx + (jack.vy - b.vy) * ny;
            if (rel > 0f) return;

            float invBall = 1f;
            float invJack = 1f / 0.42f;
            float restitution = 0.64f;
            float impulse = -(1f + restitution) * rel / (invBall + invJack);
            float ix = impulse * nx;
            float iy = impulse * ny;
            b.vx -= ix * invBall;
            b.vy -= iy * invBall;
            jack.vx += ix * invJack;
            jack.vy += iy * invJack;
        }

        private float speed2(float vx, float vy) {
            return vx * vx + vy * vy;
        }

        private void finishThrow() {
            if (!throwInProgress) return;
            throwInProgress = false;
            lastFrameNs = 0L;

            if (used[0] + used[1] >= 6) {
                resolveEnd();
            } else {
                currentPlayer = 1 - currentPlayer;
            }
            invalidate();
        }

        private void resolveEnd() {
            float best0 = Float.MAX_VALUE;
            float best1 = Float.MAX_VALUE;
            for (Ball b : balls) {
                float d = distanceToJack(b);
                if (b.team == 0) best0 = Math.min(best0, d);
                else best1 = Math.min(best1, d);
            }

            int winner;
            if (Math.abs(best0 - best1) < 0.5f) {
                winner = best0 <= best1 ? 0 : 1;
            } else {
                winner = best0 < best1 ? 0 : 1;
            }
            int loser = 1 - winner;
            float loserBest = loser == 0 ? best0 : best1;
            int points = 0;
            for (Ball b : balls) {
                if (b.team == winner && distanceToJack(b) < loserBest) points++;
            }
            if (points < 1) points = 1;

            score[winner] += points;
            lastEndWinner = winner;
            lastEndPoints = points;
            endResolved = true;
            if (score[winner] >= 13) gameOver = true;
        }

        private float distanceToJack(Ball b) {
            float dx = b.x - jack.x;
            float dy = b.y - jack.y;
            return (float) Math.sqrt(dx * dx + dy * dy);
        }

        static class Ball {
            float x;
            float y;
            final float r;
            final int team;
            float vx;
            float vy;

            Ball(float x, float y, float r, int team, float vx, float vy) {
                this.x = x;
                this.y = y;
                this.r = r;
                this.team = team;
                this.vx = vx;
                this.vy = vy;
            }
        }

        static class Jack {
            float x;
            float y;
            final float r;
            float vx;
            float vy;

            Jack(float x, float y, float r) {
                this.x = x;
                this.y = y;
                this.r = r;
                this.vx = 0f;
                this.vy = 0f;
            }
        }
    }
}
